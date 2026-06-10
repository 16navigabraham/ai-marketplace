import axios from 'axios';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';
import { AppError } from '@/middleware/errorHandler';
import { InferenceRequest, InferenceResponse } from '@/types';

interface LLMResponse {
  content: string;
  tokens?: number;
  model: string;
}

export class InferenceService {
  private openaiApiKey: string | undefined;
  private anthropicApiKey: string | undefined;

  constructor() {
    this.openaiApiKey = env.OPENAI_API_KEY;
    this.anthropicApiKey = env.ANTHROPIC_API_KEY;
  }

  async runInference(request: InferenceRequest): Promise<InferenceResponse> {
    try {
      // Route to appropriate LLM based on config
      let response: LLMResponse;

      if (this.anthropicApiKey) {
        response = await this.callClaude(request);
      } else if (this.openaiApiKey) {
        response = await this.callOpenAI(request);
      } else {
        response = await this.callMockLLM(request);
      }

      logger.info(`Inference completed for agent ${request.agentId}`, {
        model: response.model,
        tokens: response.tokens,
      });

      return {
        result: response.content,
        tokens: response.tokens || 0,
        model: response.model,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to run inference:', error);
      throw new AppError('Failed to run inference', 500, 'INFERENCE_ERROR');
    }
  }

  private async callClaude(request: InferenceRequest): Promise<LLMResponse> {
    try {
      const systemPrompt = this.getSystemPrompt(request.type);

      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: request.prompt,
            },
          ],
        },
        {
          headers: {
            'x-api-key': this.anthropicApiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
        }
      );

      const content = response.data.content[0]?.text || '';
      const tokens = response.data.usage?.output_tokens || 0;

      return {
        content,
        tokens,
        model: 'claude-3-5-sonnet-20241022',
      };
    } catch (error) {
      logger.error('Claude API call failed:', error);
      // Fallback to mock if API fails
      return this.callMockLLM(request);
    }
  }

  private async callOpenAI(request: InferenceRequest): Promise<LLMResponse> {
    try {
      const systemPrompt = this.getSystemPrompt(request.type);

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4-turbo',
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: request.prompt,
            },
          ],
          max_tokens: 1024,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const content = response.data.choices[0]?.message?.content || '';
      const tokens = response.data.usage?.completion_tokens || 0;

      return {
        content,
        tokens,
        model: 'gpt-4-turbo',
      };
    } catch (error) {
      logger.error('OpenAI API call failed:', error);
      // Fallback to mock if API fails
      return this.callMockLLM(request);
    }
  }

  private async callMockLLM(request: InferenceRequest): Promise<LLMResponse> {
    // Mock implementation for development/testing
    const mockResponses: Record<string, string> = {
      writing: `I've analyzed your request and composed a response. This is a mock response for the "${request.agentId}" writing agent. The prompt you provided was: "${request.prompt}". In a production environment, this would be replaced with actual LLM output from Claude or OpenAI.`,
      research: `Research findings: Based on your query about "${request.prompt}", here are some insights. This mock research agent would provide detailed analysis and citations in production.`,
      governance: `Governance analysis: For the proposal "${request.prompt}", here's my assessment of the governance implications. A production governance agent would analyze on-chain voting patterns and stakeholder positions.`,
      butler: `Butler response: I'm ready to assist with "${request.prompt}". This mock butler agent would handle various administrative tasks and queries in production.`,
    };

    const response = mockResponses[request.type] || mockResponses['writing'];

    return {
      content: response,
      tokens: Math.floor(Math.random() * 500 + 100),
      model: 'mock-llm',
    };
  }

  private getSystemPrompt(type: 'writing' | 'research' | 'governance' | 'butler'): string {
    const prompts: Record<string, string> = {
      writing:
        'You are an expert writing assistant. Help users create high-quality written content including articles, essays, and creative writing. Provide clear, engaging, and well-structured responses.',
      research:
        'You are a research expert. Provide thorough, well-researched responses with relevant insights and analysis. Focus on accuracy and depth in your explanations.',
      governance:
        'You are a governance expert specialized in blockchain and DAO governance. Analyze governance proposals, voting mechanisms, and stakeholder interests. Provide balanced perspectives on governance decisions.',
      butler:
        'You are a helpful AI butler assistant. Provide practical assistance, answer questions, and help with various administrative and informational tasks. Be courteous and efficient.',
    };

    return prompts[type] || prompts.writing;
  }

  async validateRequest(request: InferenceRequest): Promise<boolean> {
    if (!request.agentId || !request.prompt) {
      throw new AppError('Missing required fields: agentId and prompt', 400, 'VALIDATION_ERROR');
    }

    if (request.prompt.length > 10000) {
      throw new AppError('Prompt exceeds maximum length of 10000 characters', 400, 'VALIDATION_ERROR');
    }

    if (!['writing', 'research', 'governance', 'butler'].includes(request.type)) {
      throw new AppError('Invalid agent type', 400, 'VALIDATION_ERROR');
    }

    return true;
  }
}
