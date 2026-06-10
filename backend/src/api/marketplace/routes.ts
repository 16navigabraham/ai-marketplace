import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { PaginatedResponse, Trade } from '@/types';
import { MarketplaceService } from '@/services/MarketplaceService';
import { AppError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

const router = Router();
const marketplaceService = new MarketplaceService();

// Validation schemas
const buyQuoteSchema = z.object({
  agentTokenId: z.string().uuid(),
  amountToSpend: z.string().regex(/^\d+$/),
});

const sellQuoteSchema = z.object({
  agentTokenId: z.string().uuid(),
  tokenAmount: z.string().regex(/^\d+$/),
});

// GET /api/marketplace/trades/:agentId - Get trade history
router.get('/trades/:agentId', async (req: Request, res: Response<PaginatedResponse<Trade>>) => {
  try {
    const { agentId } = req.params;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));

    const result = await marketplaceService.getTradeHistory(agentId, page, limit);

    res.json({
      data: result.trades,
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Failed to get trade history:', error);
    throw new AppError('Failed to get trade history', 500, 'TRADES_FETCH_ERROR');
  }
});

// GET /api/marketplace/price/:agentTokenId - Get market price with bonding curve
router.get('/price/:agentTokenId', async (req: Request, res: Response) => {
  try {
    const { agentTokenId } = req.params;
    const chain = (req.query.chain as string) || 'ethereum';

    const priceData = await marketplaceService.getTokenPrice(agentTokenId, chain);

    res.json({
      agentTokenId,
      chain,
      price: priceData.price,
      marketCap: priceData.marketCap,
      priceChange24h: priceData.priceChange24h,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Failed to get token price:', error);
    throw new AppError('Failed to get token price', 500, 'PRICE_FETCH_ERROR');
  }
});

// POST /api/marketplace/quote/buy - Calculate buy quote
router.post('/quote/buy', async (req: Request, res: Response) => {
  try {
    const validated = buyQuoteSchema.parse(req.body);
    const quote = await marketplaceService.calculateBuyQuote(
      validated.agentTokenId,
      validated.amountToSpend
    );

    res.json({
      amountToSpend: validated.amountToSpend,
      tokenAmount: quote.tokenAmount,
      averagePrice: quote.averagePrice,
      priceImpact: quote.priceImpact,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError('Invalid request data', 400, 'VALIDATION_ERROR');
    }
    if (error instanceof AppError) throw error;
    logger.error('Failed to calculate buy quote:', error);
    throw new AppError('Failed to calculate buy quote', 500, 'QUOTE_CALC_ERROR');
  }
});

// POST /api/marketplace/quote/sell - Calculate sell quote
router.post('/quote/sell', async (req: Request, res: Response) => {
  try {
    const validated = sellQuoteSchema.parse(req.body);
    const quote = await marketplaceService.calculateSellQuote(
      validated.agentTokenId,
      validated.tokenAmount
    );

    res.json({
      tokenAmount: validated.tokenAmount,
      proceeds: quote.proceeds,
      averagePrice: quote.averagePrice,
      priceImpact: quote.priceImpact,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError('Invalid request data', 400, 'VALIDATION_ERROR');
    }
    if (error instanceof AppError) throw error;
    logger.error('Failed to calculate sell quote:', error);
    throw new AppError('Failed to calculate sell quote', 500, 'QUOTE_CALC_ERROR');
  }
});

// GET /api/marketplace/stats/:agentId - Get market statistics
router.get('/stats/:agentId', async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const stats = await marketplaceService.getMarketStats(agentId);

    res.json({
      agentId,
      ...stats,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Failed to get market stats:', error);
    throw new AppError('Failed to get market stats', 500, 'STATS_FETCH_ERROR');
  }
});

export default router;
