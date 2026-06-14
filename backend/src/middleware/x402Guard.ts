import { Request, Response, NextFunction } from 'express';
import { ethers } from 'ethers';
import { AppDataSource } from '@/database/data-source';
import { Nonce } from '@/models/Nonce';
import { AppError } from './errorHandler';
import { logger } from '@/utils/logger';

// Default USDC parameters for Base Sepolia
const DEFAULT_USDC_ADDRESS = '0x036cbd53842c5426634e7929541ec2318f3dcf7e';
const DEFAULT_CHAIN_ID = 84532;
const DEFAULT_TOKEN_NAME = 'USD Coin';
const DEFAULT_TOKEN_VERSION = '2';

export interface X402PaymentDetails {
  from: string;
  to: string;
  value: string;
  validAfter: number;
  validBefore: number;
  nonce: string;
  tokenAddress: string;
  chainId: number;
  signature: string;
}

// Extend Request type to hold payment details
declare global {
  namespace Express {
    interface Request {
      payment?: X402PaymentDetails;
    }
  }
}

export async function x402Guard(req: Request, res: Response, next: NextFunction) {
  try {
    // 1. Extract details from Headers or Body
    const signature = (req.headers['x-402-signature'] as string) || req.body.payment?.signature;
    const from = (req.headers['x-402-from'] as string) || req.body.payment?.from;
    const to = (req.headers['x-402-to'] as string) || req.body.payment?.to;
    const valueStr = (req.headers['x-402-value'] as string) || req.body.payment?.value;
    const nonce = (req.headers['x-402-nonce'] as string) || req.body.payment?.nonce;
    const validAfterStr = (req.headers['x-402-valid-after'] as string) || req.body.payment?.validAfter;
    const validBeforeStr = (req.headers['x-402-valid-before'] as string) || req.body.payment?.validBefore;
    const tokenAddress = (req.headers['x-402-token'] as string) || req.body.payment?.tokenAddress || DEFAULT_USDC_ADDRESS;
    const chainId = parseInt((req.headers['x-402-chain-id'] as string) || req.body.payment?.chainId || String(DEFAULT_CHAIN_ID), 10);

    // 2. Validate presence of all x402 parameters
    if (
      !signature ||
      !from ||
      !to ||
      !valueStr ||
      !nonce ||
      validAfterStr === undefined ||
      validBeforeStr === undefined
    ) {
      logger.warn('Access denied: Missing x402 payment details');
      res.setHeader('X-402-Payment-Required', 'true');
      res.setHeader('X-402-Price', '20000'); // e.g. 0.02 USDC
      res.setHeader('X-402-Asset', tokenAddress);
      res.setHeader('X-402-Chain-Id', String(chainId));
      
      throw new AppError(
        'Payment Required. Please provide a valid EIP-3009 transfer signature in headers or body.',
        402,
        'PAYMENT_REQUIRED'
      );
    }

    const value = valueStr.toString();
    const validAfter = parseInt(validAfterStr.toString(), 10);
    const validBefore = parseInt(validBeforeStr.toString(), 10);

    // 3. Check signature validity expiration windows (5 minutes threshold / safety padding)
    const currentTimeSec = Math.floor(Date.now() / 1000);
    if (currentTimeSec > validBefore) {
      throw new AppError('Payment signature has expired.', 401, 'EXPIRED_SIGNATURE');
    }
    if (currentTimeSec < validAfter) {
      throw new AppError('Payment signature is not active yet.', 401, 'INACTIVE_SIGNATURE');
    }

    // 4. Double-spend protection (Nonce check in SQLite/Turso DB)
    const nonceRepo = AppDataSource.getRepository(Nonce);
    const existingNonce = await nonceRepo.findOne({ where: { nonce } });
    if (existingNonce) {
      logger.error(`Replay attack prevented: Nonce ${nonce} already used by ${from}`);
      throw new AppError(
        'Transaction Replay Blocked: Nonce has already been redeemed.',
        400,
        'DUPLICATE_NONCE'
      );
    }

    // 5. Verify the EIP-712 EIP-3009 typed signature
    const domain = {
      name: DEFAULT_TOKEN_NAME,
      version: DEFAULT_TOKEN_VERSION,
      chainId,
      verifyingContract: tokenAddress,
    };

    const types = {
      TransferWithAuthorization: [
        { name: 'from', type: 'address' },
        { name: 'to', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'validAfter', type: 'uint256' },
        { name: 'validBefore', type: 'uint256' },
        { name: 'nonce', type: 'bytes32' },
      ],
    };

    const message = {
      from,
      to,
      value: BigInt(value),
      validAfter: BigInt(validAfter),
      validBefore: BigInt(validBefore),
      nonce,
    };

    let recoveredAddress: string;
    try {
      recoveredAddress = ethers.verifyTypedData(domain, types, message, signature);
    } catch (err) {
      logger.error('Signature decoding error:', err);
      throw new AppError('Failed to parse signature or recovered address.', 400, 'INVALID_SIGNATURE_FORMAT');
    }

    if (recoveredAddress.toLowerCase() !== from.toLowerCase()) {
      logger.warn(`Signature recovery mismatch: expected ${from}, got ${recoveredAddress}`);
      throw new AppError('Cryptographic signature verification failed.', 401, 'INVALID_SIGNATURE');
    }

    // 6. Persist the nonce to prevent replay attacks
    const newNonce = nonceRepo.create({
      nonce,
      userAddress: from,
    });
    await nonceRepo.save(newNonce);

    // Save payment details to the request context
    req.payment = {
      from,
      to,
      value,
      validAfter,
      validBefore,
      nonce,
      tokenAddress,
      chainId,
      signature,
    };

    logger.info(`x402 payment authorization verified successfully from ${from} for ${value} USDC`);
    next();
  } catch (error) {
    next(error);
  }
}
