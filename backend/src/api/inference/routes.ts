import { Router, Request, Response } from 'express';
import { InferenceRequest, InferenceResponse } from '@/types';

const router = Router();

// POST /api/inference/run - Run inference
router.post('/run', async (req: Request<{}, any, InferenceRequest>, res: Response<InferenceResponse>) => {
  const { agentId, prompt, type, userAddress } = req.body;

  // TODO: Call LLM API (OpenAI, Claude, etc.)
  // TODO: Track usage for billing

  res.json({
    result: '',
    tokens: 0,
    model: '',
    timestamp: new Date(),
  });
});

export default router;
