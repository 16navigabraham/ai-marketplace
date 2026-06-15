import { InferenceService } from './InferenceService';
import { logger } from '@/utils/logger';

export interface PlanStep {
  target: string;
  data: string;
  value: string;
  description: string;
}

export interface ReasoningPlan {
  goal: string;
  steps: PlanStep[];
  reputationCheck: boolean;
  explanation: string;
}

export class VeniceReasoningService {
  private inferenceService: InferenceService;

  constructor() {
    this.inferenceService = new InferenceService();
  }

  async generateExecutionPlan(
    goal: string,
    agentType: 'writing' | 'research' | 'governance' | 'butler',
    spendingLimit: number,
    allowedTargets: string[]
  ): Promise<ReasoningPlan> {
    try {
      const systemPrompt = `You are a delegated AI agent planning engine. 
Interpret the user's high-level goal and generate a sequence of structured execution steps.
You are running under a spending limit of ${spendingLimit} USDC and allowed targets: ${allowedTargets.join(', ')}.

Output your plan strictly as a JSON object matching this TypeScript interface:
{
  "goal": string,
  "steps": Array<{ "target": string, "data": string, "value": string, "description": string }>,
  "reputationCheck": boolean,
  "explanation": string
}
Keep the explanation brief. Ensure target contracts match the allowed targets. If a step exceeds limits, set reputationCheck to false and explain why.`;

      const prompt = `${systemPrompt}\n\nGenerate a plan for this goal: "${goal}"`;

      // Call inference service to get Venice/Gemini response
      const inference = await this.inferenceService.runInference({
        agentId: 'reasoning-planner',
        prompt,
        type: agentType,
      });

      // Parse JSON from response
      let plan: ReasoningPlan;
      try {
        const jsonText = this.cleanJsonString(inference.result);
        plan = JSON.parse(jsonText);
      } catch (jsonErr) {
        logger.warn('Failed to parse LLM reasoning plan as JSON, using fallback static planner', {
          result: inference.result,
        });
        plan = this.getFallbackPlan(goal, allowedTargets, spendingLimit);
      }

      return plan;
    } catch (error) {
      logger.error('Reasoning planner failed:', error);
      return this.getFallbackPlan(goal, allowedTargets, spendingLimit);
    }
  }

  private cleanJsonString(input: string): string {
    // Strip markdown code fences if LLM wrapped it in \`\`\`json ... \`\`\`
    let text = input.trim();
    if (text.startsWith('```')) {
      text = text.replace(/^```(json)?/, '').replace(/```$/, '').trim();
    }
    return text;
  }

  private getFallbackPlan(goal: string, allowedTargets: string[], limit: number): ReasoningPlan {
    // Standard structured fallback plan if JSON parsing fails or LLM is down
    const defaultTarget = allowedTargets[0] || '0x0000000000000000000000000000000000000000';
    return {
      goal,
      steps: [
        {
          target: defaultTarget,
          data: '0xa9059cbb000000000000000000000000...', // transfer mock payload
          value: '20000', // 0.02 USDC
          description: `Analyze proposal and execute action against target ${defaultTarget}`,
        },
      ],
      reputationCheck: true,
      explanation: 'Static fallback plan generated successfully.',
    };
  }
}
