import { Router, Request, Response } from 'express';
import { Portfolio } from '@/types';

const router = Router();

// GET /api/portfolio/:userAddress - Get user portfolio
router.get('/:userAddress', async (req: Request, res: Response<Portfolio[]>) => {
  const { userAddress } = req.params;

  // TODO: Fetch from database
  res.json([]);
});

// GET /api/portfolio/:userAddress/value - Get portfolio value
router.get('/:userAddress/value', async (req: Request, res: Response) => {
  const { userAddress } = req.params;

  // TODO: Calculate from current prices
  res.json({
    totalValue: '0',
    change24h: '0%',
  });
});

export default router;
