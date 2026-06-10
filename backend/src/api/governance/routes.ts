import { Router, Request, Response } from 'express';
import { PaginatedResponse } from '@/types';

const router = Router();

// GET /api/governance/proposals - List governance proposals
router.get('/proposals', async (req: Request, res: Response<PaginatedResponse<any>>) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  // TODO: Fetch from governance contract
  res.json({
    data: [],
    total: 0,
    page,
    limit,
  });
});

// GET /api/governance/voting-power/:userAddress - Get voting power
router.get('/voting-power/:userAddress', async (req: Request, res: Response) => {
  const { userAddress } = req.params;

  // TODO: Query blockchain for staked veVIRTUAL
  res.json({
    power: '0',
    veVIRTUAL: '0',
  });
});

export default router;
