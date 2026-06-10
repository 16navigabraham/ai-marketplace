// Shared types between frontend and backend

export interface Agent {
  id: string;
  name: string;
  description: string;
  creatorAddress: string;
  type: AgentType;
  avatarUrl?: string;
  tokenAddresses: Record<string, string>;
  chains: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type AgentType = 'writing' | 'research' | 'governance' | 'butler';

export interface AgentToken {
  id: string;
  agentId: string;
  chain: string;
  contractAddress: string;
  totalSupply: string;
  price: string;
  marketCap: string;
  updatedAt: Date;
}

export interface Trade {
  id: string;
  agentId: string;
  buyer: string;
  seller: string;
  amount: string;
  price: string;
  chain: string;
  txHash: string;
  createdAt: Date;
}

export interface Portfolio {
  id: string;
  userAddress: string;
  agentId: string;
  chain: string;
  balance: string;
  updatedAt: Date;
}

export interface User {
  id: string;
  walletAddress: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  code: string;
  message: string;
  status: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface InferenceRequest {
  agentId: string;
  prompt: string;
  type: AgentType;
  userAddress?: string;
}

export interface InferenceResponse {
  result: string;
  tokens: number;
  model: string;
  timestamp: Date;
}

export interface ChainConfig {
  id: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
}

export const SUPPORTED_CHAINS = {
  ethereum: { id: 1, name: 'Ethereum' },
  polygon: { id: 137, name: 'Polygon' },
  arbitrum: { id: 42161, name: 'Arbitrum' },
  base: { id: 8453, name: 'Base' },
} as const;

export type ChainName = keyof typeof SUPPORTED_CHAINS;
