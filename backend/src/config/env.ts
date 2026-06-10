import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001').transform(Number),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // Database
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().default('5432').transform(Number),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().default('postgres'),
  DB_NAME: z.string().default('ai_marketplace'),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // Blockchain
  ETH_RPC_URL: z.string(),
  POLYGON_RPC_URL: z.string(),
  ARBITRUM_RPC_URL: z.string(),
  BASE_RPC_URL: z.string(),

  // LLM APIs
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // Contract Addresses (will be set during deployment)
  AGENT_CONTRACT_ADDRESS: z.string().optional(),
  MARKETPLACE_CONTRACT_ADDRESS: z.string().optional(),
  GOVERNANCE_CONTRACT_ADDRESS: z.string().optional(),
});

export const env = envSchema.parse(process.env);
