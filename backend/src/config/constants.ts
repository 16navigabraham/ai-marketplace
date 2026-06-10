// Bonding Curve Parameters
export const BONDING_CURVE = {
  INITIAL_PRICE: BigInt('1000000000000000'), // 0.001 ETH in wei (18 decimals)
  PRICE_MULTIPLIER: 1.0001, // 0.01% increase per token
  MIN_BUY: BigInt('1000000000000000'), // 0.001 ETH minimum
};

// Trading Fees
export const TRADING_FEES = {
  BUYER_FEE_PERCENT: 2, // 2% fee for buyers
  SELLER_FEE_PERCENT: 2, // 2% fee for sellers
  PROTOCOL_SHARE_PERCENT: 50, // 50% to protocol, 50% to agent creator
};

// Portfolio Settings
export const PORTFOLIO = {
  MAX_HOLDINGS_PER_USER: 1000,
  PRICE_UPDATE_INTERVAL_MS: 60000, // Update prices every minute
};

// Pagination
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
};

// Agent Types
export const AGENT_TYPES = ['writing', 'research', 'governance', 'butler'] as const;

// Supported Chains
export const SUPPORTED_CHAINS = ['ethereum', 'polygon', 'arbitrum', 'base'] as const;

// Governance
export const GOVERNANCE = {
  VOTING_POWER_MULTIPLIER: BigInt('1000000000000000000'), // 1e18
  PROPOSAL_MIN_DELEGATION: BigInt('1000000000000000000'), // 1 token
  VOTING_PERIOD_BLOCKS: 10000,
};

// LLM Configuration
export const LLM_CONFIG = {
  MAX_PROMPT_LENGTH: 10000,
  MAX_COMPLETION_TOKENS: 1024,
  DEFAULT_MODEL: 'claude-3-5-sonnet-20241022',
  TIMEOUT_MS: 30000,
};

// Validation
export const VALIDATION = {
  MIN_AGENT_NAME_LENGTH: 1,
  MAX_AGENT_NAME_LENGTH: 255,
  MIN_DESCRIPTION_LENGTH: 1,
  ADDRESS_REGEX: /^0x[a-fA-F0-9]{40}$/,
};
