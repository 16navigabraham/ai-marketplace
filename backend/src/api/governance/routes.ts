import { Router, Request, Response } from 'express';
import { PaginatedResponse } from '@/types';
import { BlockchainService } from '@/services/BlockchainService';
import { AppError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

const router = Router();
const blockchainService = new BlockchainService();

// Mock governance data storage (in production, use contracts/indexer)
const mockProposals = [
  {
    id: '1',
    title: 'Increase marketplace fee to 3%',
    description: 'Proposal to increase the platform marketplace fee from 2% to 3%',
    proposer: '0x742d35Cc6634C0532925a3b844Bc9e7595f42aE0',
    startBlock: 18000000,
    endBlock: 18010000,
    status: 'active',
    forVotes: '1000000000000000000000',
    againstVotes: '500000000000000000000',
    abstainVotes: '100000000000000000000',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    title: 'Add new agent type: trading',
    description: 'Proposal to add a new trading agent type to the marketplace',
    proposer: '0x742d35Cc6634C0532925a3b844Bc9e7595f42aE0',
    startBlock: 18010000,
    endBlock: 18020000,
    status: 'voting',
    forVotes: '800000000000000000000',
    againstVotes: '200000000000000000000',
    abstainVotes: '50000000000000000000',
    createdAt: new Date('2024-01-15'),
  },
];

// GET /api/governance/proposals - List governance proposals
router.get('/proposals', async (req: Request, res: Response<PaginatedResponse<any>>) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const status = (req.query.status as string) || undefined;

    // Filter by status if provided
    let filteredProposals = mockProposals;
    if (status) {
      filteredProposals = mockProposals.filter((p) => p.status === status);
    }

    const total = filteredProposals.length;
    const skip = (page - 1) * limit;
    const data = filteredProposals.slice(skip, skip + limit);

    res.json({
      data,
      total,
      page,
      limit,
    });
  } catch (error) {
    logger.error('Failed to fetch proposals:', error);
    throw new AppError('Failed to fetch proposals', 500, 'PROPOSALS_FETCH_ERROR');
  }
});

// GET /api/governance/proposals/:id - Get proposal details
router.get('/proposals/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const proposal = mockProposals.find((p) => p.id === id);

    if (!proposal) {
      throw new AppError('Proposal not found', 404, 'PROPOSAL_NOT_FOUND');
    }

    res.json(proposal);
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Failed to fetch proposal:', error);
    throw new AppError('Failed to fetch proposal', 500, 'PROPOSAL_FETCH_ERROR');
  }
});

// GET /api/governance/voting-power/:userAddress - Get voting power
router.get('/voting-power/:userAddress', async (req: Request, res: Response) => {
  try {
    const { userAddress } = req.params;

    // Validate address format
    if (!userAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      throw new AppError('Invalid wallet address format', 400, 'INVALID_ADDRESS');
    }

    // In production, this would query the governance/staking contract
    // For now, return mock data
    const mockVotingPower = {
      userAddress,
      votingPower: '1000000000000000000000', // 1000 tokens (wei)
      veVIRTUAL: '500000000000000000000', // 500 veVIRTUAL
      delegatedTo: null,
      delegatedFrom: [],
      lastVoteTime: new Date(),
      canVote: true,
    };

    res.json(mockVotingPower);
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Failed to get voting power:', error);
    throw new AppError('Failed to get voting power', 500, 'VOTING_POWER_ERROR');
  }
});

// GET /api/governance/delegates/:userAddress - Get delegated voting power
router.get('/delegates/:userAddress', async (req: Request, res: Response) => {
  try {
    const { userAddress } = req.params;

    // Validate address format
    if (!userAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      throw new AppError('Invalid wallet address format', 400, 'INVALID_ADDRESS');
    }

    // Mock delegation data
    const mockDelegation = {
      userAddress,
      delegatedTo: null,
      delegatedFrom: [
        '0x742d35Cc6634C0532925a3b844Bc9e7595f42aE0',
        '0x123456789abcdef0123456789abcdef012345678',
      ],
      totalDelegated: '2500000000000000000000',
    };

    res.json(mockDelegation);
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Failed to get delegates:', error);
    throw new AppError('Failed to get delegates', 500, 'DELEGATES_FETCH_ERROR');
  }
});

// GET /api/governance/votes/:proposalId/:userAddress - Get user vote on proposal
router.get('/votes/:proposalId/:userAddress', async (req: Request, res: Response) => {
  try {
    const { proposalId, userAddress } = req.params;

    // Validate address format
    if (!userAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      throw new AppError('Invalid wallet address format', 400, 'INVALID_ADDRESS');
    }

    // Mock vote data
    const mockVote = {
      proposalId,
      userAddress,
      vote: 'for', // 'for', 'against', 'abstain', or null
      weight: '1000000000000000000000',
      timestamp: new Date(),
    };

    res.json(mockVote);
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Failed to get vote:', error);
    throw new AppError('Failed to get vote', 500, 'VOTE_FETCH_ERROR');
  }
});

// POST /api/governance/proposals - Create proposal (requires delegation)
router.post('/proposals', async (req: Request, res: Response) => {
  try {
    const { title, description, proposer } = req.body;

    if (!title || !description || !proposer) {
      throw new AppError('Missing required fields', 400, 'VALIDATION_ERROR');
    }

    // Validate address format
    if (!proposer.match(/^0x[a-fA-F0-9]{40}$/)) {
      throw new AppError('Invalid wallet address format', 400, 'INVALID_ADDRESS');
    }

    // In production, would verify proposer has sufficient delegation
    const newProposal = {
      id: (mockProposals.length + 1).toString(),
      title,
      description,
      proposer,
      startBlock: 18000000 + mockProposals.length * 1000,
      endBlock: 18010000 + mockProposals.length * 1000,
      status: 'pending',
      forVotes: '0',
      againstVotes: '0',
      abstainVotes: '0',
      createdAt: new Date(),
    };

    mockProposals.push(newProposal);
    logger.info(`Proposal created: ${newProposal.id} by ${proposer}`);

    res.status(201).json(newProposal);
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Failed to create proposal:', error);
    throw new AppError('Failed to create proposal', 500, 'PROPOSAL_CREATE_ERROR');
  }
});

export default router;
