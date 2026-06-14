import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { InferenceRequest, InferenceResponse } from '@/types';
import { InferenceService } from '@/services/InferenceService';
import { AppError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { x402Guard } from '@/middleware/x402Guard';

const router = Router();
const inferenceService = new InferenceService();

// Validation schemas
const inferenceRequestSchema = z.object({
  agentId: z.string().uuid(),
  prompt: z.string().min(1).max(10000),
  type: z.enum(['writing', 'research', 'governance', 'butler']),
  userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
});

// POST /api/inference/run - Run inference (protected by x402Guard)
router.post('/run', x402Guard, async (req: Request<{}, any, InferenceRequest>, res: Response<InferenceResponse>) => {
  try {
    const validated = inferenceRequestSchema.parse(req.body);

    // Validate request
    await inferenceService.validateRequest(validated);

    // Run inference
    const result = await inferenceService.runInference(validated);

    logger.info(`Inference executed for agent ${validated.agentId}`, {
      model: result.model,
      tokens: result.tokens,
      userAddress: validated.userAddress,
    });

    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError('Invalid request data', 400, 'VALIDATION_ERROR');
    }
    if (error instanceof AppError) throw error;
    logger.error('Failed to run inference:', error);
    throw new AppError('Failed to run inference', 500, 'INFERENCE_ERROR');
  }
});

// POST /api/inference/batch - Run batch inference (multiple prompts)
router.post('/batch', async (req: Request, res: Response) => {
  try {
    const { requests } = req.body;

    if (!Array.isArray(requests)) {
      throw new AppError('requests must be an array', 400, 'VALIDATION_ERROR');
    }

    if (requests.length > 10) {
      throw new AppError('Maximum 10 requests per batch', 400, 'VALIDATION_ERROR');
    }

    // Validate all requests
    const validatedRequests = requests.map((req) => inferenceRequestSchema.parse(req));

    // Run all inferences in parallel
    const results = await Promise.all(validatedRequests.map((req) => inferenceService.runInference(req)));

    logger.info(`Batch inference executed with ${results.length} requests`);

    res.json({
      count: results.length,
      results,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new AppError('Invalid request data', 400, 'VALIDATION_ERROR');
    }
    if (error instanceof AppError) throw error;
    logger.error('Failed to run batch inference:', error);
    throw new AppError('Failed to run batch inference', 500, 'BATCH_INFERENCE_ERROR');
  }
});

export default router;
