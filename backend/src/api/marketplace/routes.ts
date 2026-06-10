import { Router, Request, Response } from 'express';
import { PaginatedResponse, Trade } from '@/types';

const router = Router();

// GET /api/marketplace/trades/:agentId - Get trade history
router.get('/trades/:agentId', async (req: Request, res: Response<PaginatedResponse<Trade>>) => {
  const { agentId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  // TODO: Fetch from blockchain indexer
  res.json({
    data: [],
    total: 0,
    page,
    limit,
  });
});

// GET /api/marketplace/price/:agentId - Get market price
router.get('/price/:agentId', async (req: Request, res: Response) => {
  const { agentId } = req.params;
  const { chain } = req.query;

  // TODO: Calculate from bonding curve
  res.json({
    price: '0',
    change24h: '0%',
  });
});

export default router;
