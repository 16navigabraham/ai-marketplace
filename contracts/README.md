# AI Agents Marketplace - Smart Contracts

Smart contracts for the multi-chain AI Agents Marketplace built with Foundry.

## Contracts

### Agent.sol
- ERC-721 NFT for representing AI agents
- Mints an NFT for each new agent created
- Stores agent metadata (name, description, type, creator)
- Associates each agent with its token contract

### AgentToken.sol
- ERC-20 token created for each agent
- Initial supply: 1M tokens
- Allows minting and burning
- Represents ownership/stake in an agent

### BondingCurve.sol
- Implements quadratic bonding curve for agent token pricing
- Price formula: `price = k * supply²`
- Handles buy/sell operations with automatic pricing
- Maintains ETH reserves for token redemptions

## Development

### Prerequisites
- Foundry: https://getfoundry.sh

### Installation
```bash
# Clone and install
forge install openzeppelin/openzeppelin-contracts
```

### Compilation
```bash
forge build
```

### Testing
```bash
forge test -vvv
forge test --gas-report
```

### Deployment Scripts
Scripts are located in the `script/` directory for deploying to different networks.

```bash
# Ethereum
forge script script/Deploy.s.sol --rpc-url $ETH_RPC_URL --broadcast

# Polygon
forge script script/Deploy.s.sol --rpc-url $POLYGON_RPC_URL --broadcast

# Arbitrum
forge script script/Deploy.s.sol --rpc-url $ARBITRUM_RPC_URL --broadcast

# Base
forge script script/Deploy.s.sol --rpc-url $BASE_RPC_URL --broadcast
```

## Smart Contract Architecture

```
Agent (NFT)
    ↓
    └─→ AgentToken (ERC-20 per agent)
            ↓
            └─→ BondingCurve (pricing & trading)
```

## Key Features

- **Multi-chain Deployment**: Deploy to Ethereum, Polygon, Arbitrum, Base
- **Bonding Curve Pricing**: Automatic price discovery based on supply
- **Agent NFT**: Each agent is an NFT with metadata
- **Token Economics**: Each agent has its own ERC-20 token
