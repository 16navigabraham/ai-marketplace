import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { ReputationService } from '@/services/ReputationService';
import { VeniceReasoningService } from '@/services/VeniceReasoningService';
import { AppError } from '@/middleware/errorHandler';

const router = Router();
const reputationService = new ReputationService();
const reasoningService = new VeniceReasoningService();

// Validation schemas
const stakeSchema = z.object({
  agentId: z.string(),
  amount: z.string().regex(/^\d+$/),
});

const reportSchema = z.object({
  agentId: z.string(),
});

const planSchema = z.object({
  goal: z.string(),
  agentType: z.enum(['writing', 'research', 'governance', 'butler']),
  spendingLimit: z.number().default(100),
  allowedTargets: z.array(z.string()).default([]),
});

router.get('/:agentId', async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;
    const rep = await reputationService.getReputation(agentId);
    res.json(rep);
  } catch (error) {
    throw new AppError('Failed to fetch reputation data', 500, 'REPUTATION_FETCH_ERROR');
  }
});

router.post('/stake', async (req: Request, res: Response) => {
  try {
    const validated = stakeSchema.parse(req.body);
    const rep = await reputationService.stakeReputation(validated.agentId, validated.amount);
    res.json({ success: true, reputation: rep });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError('Invalid request format', 400, 'VALIDATION_ERROR');
    }
    throw new AppError('Staking operation failed', 500, 'STAKING_ERROR');
  }
});

router.post('/report', async (req: Request, res: Response) => {
  try {
    const validated = reportSchema.parse(req.body);
    const rep = await reputationService.reportMisbehavior(validated.agentId);
    res.json({ success: true, message: 'Dispute recorded successfully.', reputation: rep });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError('Invalid request format', 400, 'VALIDATION_ERROR');
    }
    throw new AppError('Failed to log dispute report', 500, 'DISPUTE_ERROR');
  }
});

router.post('/plan', async (req: Request, res: Response) => {
  try {
    const validated = planSchema.parse(req.body);
    const plan = await reasoningService.generateExecutionPlan(
      validated.goal,
      validated.agentType,
      validated.spendingLimit,
      validated.allowedTargets
    );
    res.json(plan);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError('Invalid goal parameters', 400, 'VALIDATION_ERROR');
    }
    throw new AppError('AI planning loop failed', 500, 'PLANNING_ERROR');
  }
});

export default router;
