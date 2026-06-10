import { env } from './env';

export interface ChainConfig {
  id: number;
  name: string;
  alchemyPath: string; // e.g., 'eth-mainnet', 'polygon-mainnet'
  blockExplorer: string;
}

export const CHAINS: Record<string, ChainConfig> = {
  ethereum: {
    id: 1,
    name: 'Ethereum',
    alchemyPath: 'eth-mainnet',
    blockExplorer: 'https://etherscan.io',
  },
  polygon: {
    id: 137,
    name: 'Polygon',
    alchemyPath: 'polygon-mainnet',
    blockExplorer: 'https://polygonscan.com',
  },
  arbitrum: {
    id: 42161,
    name: 'Arbitrum',
    alchemyPath: 'arb-mainnet',
    blockExplorer: 'https://arbiscan.io',
  },
  base: {
    id: 8453,
    name: 'Base',
    alchemyPath: 'base-mainnet',
    blockExplorer: 'https://basescan.org',
  },
};

export const DEFAULT_CHAIN = CHAINS.ethereum;

// Helper function to get RPC URL for any chain
export function getRpcUrl(chainName: string): string {
  const chain = CHAINS[chainName.toLowerCase()];
  if (!chain) {
    throw new Error(`Unknown chain: ${chainName}`);
  }
  return `https://${chain.alchemyPath}.g.alchemy.com/v2/${env.ALCHEMY_API_KEY}`;
}

// Get all RPC URLs as object
export const RPC_URLS = {
  ethereum: getRpcUrl('ethereum'),
  polygon: getRpcUrl('polygon'),
  arbitrum: getRpcUrl('arbitrum'),
  base: getRpcUrl('base'),
};

// Get RPC URL by chain ID
export function getRpcUrlById(chainId: number): string {
  const chain = Object.values(CHAINS).find((c) => c.id === chainId);
  if (!chain) {
    throw new Error(`Unknown chain ID: ${chainId}`);
  }
  return getRpcUrl(chain.name.toLowerCase());
}
