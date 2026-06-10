import { Router, Request, Response } from 'express';
import { PaginatedResponse, Agent } from '@/types';

const router = Router();

// GET /api/agents - List all agents
router.get('/', async (req: Request, res: Response<PaginatedResponse<Agent>>) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;

  // TODO: Fetch from database
  res.json({
    data: [],
    total: 0,
    page,
    limit,
  });
});

// GET /api/agents/:id - Get agent details
router.get('/:id', async (req: Request, res: Response<Agent>) => {
  const { id } = req.params;

  // TODO: Fetch from database
  res.json({} as Agent);
});

// POST /api/agents - Create new agent
router.post('/', async (req: Request, res: Response<Agent>) => {
  const agentData = req.body;

  // TODO: Create agent contract, insert into database
  res.status(201).json({} as Agent);
});

// PATCH /api/agents/:id - Update agent
router.patch('/:id', async (req: Request, res: Response<Agent>) => {
  const { id } = req.params;
  const updateData = req.body;

  // TODO: Update in database
  res.json({} as Agent);
});

export default router;
