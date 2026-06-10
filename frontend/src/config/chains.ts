export const CHAINS = {
  ethereum: {
    id: 1,
    name: 'Ethereum',
    rpcUrl: process.env.NEXT_PUBLIC_ETH_RPC || 'https://eth.public.io',
    blockExplorer: 'https://etherscan.io',
  },
  polygon: {
    id: 137,
    name: 'Polygon',
    rpcUrl: process.env.NEXT_PUBLIC_POLYGON_RPC || 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
  },
  arbitrum: {
    id: 42161,
    name: 'Arbitrum',
    rpcUrl: process.env.NEXT_PUBLIC_ARB_RPC || 'https://arb1.arbitrum.io/rpc',
    blockExplorer: 'https://arbiscan.io',
  },
  base: {
    id: 8453,
    name: 'Base',
    rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC || 'https://mainnet.base.org',
    blockExplorer: 'https://basescan.org',
  },
};

export const DEFAULT_CHAIN = CHAINS.ethereum;

export const SUPPORTED_CHAIN_IDS = Object.values(CHAINS).map((c) => c.id);
