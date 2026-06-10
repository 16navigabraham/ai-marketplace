import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { PaginatedResponse, Agent } from '@/types';
import { AgentService } from '@/services/AgentService';
import { AppError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

const router = Router();
const agentService = new AgentService();

// Validation schemas
const createAgentSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().min(1),
  creatorAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  type: z.enum(['writing', 'research', 'governance', 'butler']),
  avatarUrl: z.string().url().optional(),
  chains: z.array(z.string()).min(1),
});

const updateAgentSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  avatarUrl: z.string().url().optional(),
});

// GET /api/agents - List all agents
router.get('/', async (req: Request, res: Response<PaginatedResponse<Agent>>) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const type = (req.query.type as string) || undefined;
    const sortBy = (req.query.sortBy as 'createdAt' | 'marketCap') || 'createdAt';

    const result = await agentService.getAgents(page, limit, type, sortBy);

    res.json({
      data: result.agents,
      total: result.total,
      page: result.page,
      limit: result.limit,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Failed to list agents:', error);
    throw new AppError('Failed to list agents', 500, 'AGENTS_LIST_ERROR');
  }
});

// GET /api/agents/:id - Get agent details
router.get('/:id', async (req: Request, res: Response<Agent>) => {
  try {
    const { id } = req.params;
    const agent = await agentService.getAgentById(id);
    res.json(agent);
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Failed to get agent:', error);
    throw new AppError('Failed to get agent', 500, 'AGENT_FETCH_ERROR');
  }
});

// POST /api/agents - Create new agent
router.post('/', async (req: Request, res: Response<Agent>) => {
  try {
    const validated = createAgentSchema.parse(req.body);
    const agent = await agentService.createAgent(validated);

    res.status(201).json(agent);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError('Invalid request data', 400, 'VALIDATION_ERROR');
    }
    if (error instanceof AppError) throw error;
    logger.error('Failed to create agent:', error);
    throw new AppError('Failed to create agent', 500, 'AGENT_CREATE_ERROR');
  }
});

// PATCH /api/agents/:id - Update agent
router.patch('/:id', async (req: Request, res: Response<Agent>) => {
  try {
    const { id } = req.params;
    const validated = updateAgentSchema.parse(req.body);
    const agent = await agentService.updateAgent(id, validated);

    res.json(agent);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError('Invalid request data', 400, 'VALIDATION_ERROR');
    }
    if (error instanceof AppError) throw error;
    logger.error('Failed to update agent:', error);
    throw new AppError('Failed to update agent', 500, 'AGENT_UPDATE_ERROR');
  }
});

// POST /api/agents/:id/tokens - Register token address
router.post('/:id/tokens', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { chain, contractAddress } = req.body;

    if (!chain || !contractAddress) {
      throw new AppError('Missing chain or contractAddress', 400, 'VALIDATION_ERROR');
    }

    const token = await agentService.registerTokenAddress(id, chain, contractAddress);
    res.status(201).json(token);
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Failed to register token:', error);
    throw new AppError('Failed to register token', 500, 'TOKEN_REGISTER_ERROR');
  }
});

// GET /api/agents/:id/tokens - Get agent tokens
router.get('/:id/tokens', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tokens = await agentService.getAgentTokens(id);
    res.json(tokens);
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Failed to get agent tokens:', error);
    throw new AppError('Failed to get agent tokens', 500, 'TOKENS_FETCH_ERROR');
  }
});

// GET /api/agents/:id/trades - Get trade history
router.get('/:id/trades', async (req: Request, res: Response<PaginatedResponse<any>>) => {
  try {
    const { id } = req.params;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));

    const result = await agentService.getTradeHistory(id, page, limit);

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

export default router;
