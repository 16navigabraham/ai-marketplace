# AI Agents Marketplace - Smart Contracts

Production-ready smart contracts for the multi-chain AI Agents Marketplace built with Foundry and Solidity 0.8.20.

## Table of Contents

- [Overview](#overview)
- [Core Contracts](#core-contracts)
- [Supporting Contracts](#supporting-contracts)
- [Interfaces](#interfaces)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Architecture](#architecture)
- [Security Considerations](#security-considerations)

## Overview

The AI Agents Marketplace enables the creation, trading, and management of AI agents as NFTs with associated governance tokens. Each agent has:

- An ERC-721 NFT representing ownership
- An ERC-20 token for stake/voting rights
- Bonding curve pricing for fair token discovery
- Marketplace order management for trading

## Core Contracts

### Agent.sol (ERC-721)

Represents individual AI agents as non-fungible tokens.

**Key Features:**
- Mint agents with metadata (name, description, type, creator)
- Associate ERC-20 tokens with agents
- Track agent creation timestamps
- Support for agent types: writing, research, governance, butler

**Key Functions:**
- `createAgent(name, description, agentType)` - Create a new agent
- `setAgentTokenAddress(tokenId, tokenAddress)` - Link ERC-20 token to agent
- `getAgentMetadata(tokenId)` - Retrieve agent information
- `getTotalAgents()` - Get total count of agents

### AgentToken.sol (ERC-20)

Each agent has its own ERC-20 token for ownership and governance.

**Key Features:**
- Initial supply: 1,000,000 tokens
- Minting capability (owner only)
- Burning capability (users can burn their own tokens)
- Allowance management with increase/decrease functions

**Key Functions:**
- `mint(to, amount)` - Mint new tokens (owner only)
- `burn(amount)` - Burn tokens from caller
- `burnFrom(account, amount)` - Burn tokens using allowance
- `approve(spender, amount)` - Set allowance
- `transfer(to, amount)` - Transfer tokens

### BondingCurve.sol

Implements quadratic bonding curve pricing for automatic price discovery.

**Pricing Model:**
- Formula: `price = k * (supply^2)` where k = 1e18
- Buy price increases with supply
- Sell price decreases proportionally
- Automatic ETH reserve management

**Key Functions:**
- `getBuyPrice(token, amount)` - Calculate buy price
- `getSellPrice(token, amount)` - Calculate sell price
- `buy(token, amount)` - Buy tokens with ETH
- `sell(token, amount)` - Sell tokens for ETH
- `getReserve(token)` - View ETH reserve
- `getSupply(token)` - View bonding curve supply

**Gas Optimization:**
- Reentrancy guard on buy/sell
- Efficient supply tracking
- Refund handling for overpayments

### Marketplace.sol

Order-based marketplace for peer-to-peer agent token trading.

**Key Features:**
- Create/cancel sell orders
- Buy from orders with configurable fees
- Order status management
- Fee collection and withdrawal
- Emergency token withdrawal

**Fee Model:**
- Default: 2.5% (250 basis points)
- Maximum: 50% (5000 basis points)
- Collected and managed by marketplace owner

**Key Functions:**
- `createOrder(agentToken, amount, pricePerToken)` - List tokens for sale
- `cancelOrder(orderId)` - Remove order
- `buyFromOrder(orderId, amount)` - Purchase from order
- `setFeePercentage(feePercentage)` - Adjust fees (owner only)
- `withdrawFees()` - Claim collected fees (owner only)
- `getActiveTokenOrders(token)` - View active orders for token

## Supporting Contracts

### VIRTUAL.sol (ERC-20)

Main governance token for the marketplace.

**Features:**
- Total supply: 1,000,000,000 tokens
- Burnable (users can burn their tokens)
- Mintable (owner only)
- Standard ERC-20 with validation

**Use Cases:**
- Governance voting
- Fee payment option
- Platform rewards

### Factory.sol

Factory for creating agents and managing token deployment.

**Key Features:**
- One-call agent + token creation
- Token creation for existing agents
- Centralized agent/token tracking
- Event logging for all creations

**Key Functions:**
- `createAgentWithToken(name, desc, type, tokenName, symbol)` - Create agent + token
- `createTokenForAgent(agentId, tokenName, symbol)` - Add token to existing agent
- `getTokenAddress(agentId)` - Look up agent's token
- `getCreatedTokensCount()` - Total tokens created

## Interfaces

### IAgent.sol

Standard interface for Agent NFT contract.

### IBondingCurve.sol

Standard interface for bonding curve pricing.

### IMarketplace.sol

Standard interface for marketplace order management.

## Development

### Prerequisites

- **Foundry**: https://getfoundry.sh
- **Node.js**: v16+ (for script execution)
- **OpenZeppelin Contracts**: Installed via Foundry

### Installation

```bash
cd contracts
forge install openzeppelin/openzeppelin-contracts
```

### Project Structure

```
contracts/
├── src/
│   ├── Agent.sol
│   ├── AgentToken.sol
│   ├── BondingCurve.sol
│   ├── Marketplace.sol
│   ├── VIRTUAL.sol
│   ├── Factory.sol
│   └── interfaces/
│       ├── IAgent.sol
│       ├── IBondingCurve.sol
│       └── IMarketplace.sol
├── test/
│   ├── Agent.t.sol
│   ├── BondingCurve.t.sol
│   ├── Marketplace.t.sol
│   ├── Factory.t.sol
│   └── Integration.t.sol
├── script/
│   ├── Deploy.s.sol
│   └── Setup.s.sol
└── foundry.toml
```

### Compilation

```bash
forge build
```

## Testing

### Run All Tests

```bash
forge test -vvv
```

### Run Specific Test

```bash
forge test --match-test testBuyTokens -vvv
```

### Gas Report

```bash
forge test --gas-report
```

### Coverage

```bash
forge coverage
```

### Test Suites

1. **Agent.t.sol** - Agent NFT creation and management
2. **BondingCurve.t.sol** - Pricing calculations and trading
3. **Marketplace.t.sol** - Order management and fees
4. **Factory.t.sol** - Agent and token creation
5. **Integration.t.sol** - Full marketplace workflows

## Deployment

### Environment Setup

Create a `.env` file:

```bash
PRIVATE_KEY=your_private_key
ETH_RPC_URL=https://eth-mainnet.alchemyapi.io/v2/your-api-key
POLYGON_RPC_URL=https://polygon-rpc.com
ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc
BASE_RPC_URL=https://mainnet.base.org
```

### Deploy to Networks

```bash
# Ethereum Mainnet
forge script script/Deploy.s.sol --rpc-url $ETH_RPC_URL --broadcast --verify

# Polygon
forge script script/Deploy.s.sol --rpc-url $POLYGON_RPC_URL --broadcast --verify

# Arbitrum
forge script script/Deploy.s.sol --rpc-url $ARBITRUM_RPC_URL --broadcast --verify

# Base
forge script script/Deploy.s.sol --rpc-url $BASE_RPC_URL --broadcast --verify
```

### Setup After Deployment

After deployment, initialize marketplace state:

```bash
export AGENT_ADDRESS=0x...
export AGENT_TOKEN_ADDRESS=0x...
# ... set other addresses ...

forge script script/Setup.s.sol --rpc-url $ETH_RPC_URL --broadcast
```

### Verify Contracts on Etherscan

```bash
forge verify-contract \
  --compiler-version v0.8.20 \
  --constructor-args <encoded_args> \
  <contract_address> \
  src/Agent.sol:Agent
```

## Architecture

### System Diagram

```
┌─────────────────────────────────────────────────┐
│           AI Agents Marketplace                 │
└─────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
    ┌───▼────┐      ┌───▼────┐     ┌───▼─────┐
    │ Factory│      │Marketplace   │Bonding  │
    └────────┘      └──────────┘   │Curve    │
        │               │           └─────────┘
        │               │
        ▼               ▼
    ┌──────────────────────────┐
    │    Agent (ERC-721)       │
    │  + AgentToken (ERC-20)   │
    └──────────────────────────┘
```

### Data Flow

1. **Create Agent**: User → Factory → Agent Contract → AgentToken Contract
2. **Buy via Bonding Curve**: User → BondingCurve → Token Reserve
3. **Trade on Marketplace**: Seller → Order → Buyer (with fee to marketplace)
4. **Governance**: VIRTUAL Token holders vote on protocol changes

## Security Considerations

### Audited Patterns

- ✅ ReentrancyGuard on all monetary operations
- ✅ Input validation on all external functions
- ✅ Safe ETH transfers (no raw send)
- ✅ Reentrancy protection on buys/sells
- ✅ Proper allowance handling

### Attack Vectors Mitigated

1. **Flash Loan Attacks**: ReentrancyGuard protects buy/sell operations
2. **Price Manipulation**: Bonding curve prevents large slippage
3. **Double Spending**: ERC-20/ERC-721 standard protections
4. **Unauthorized Minting**: Ownable guards on mint functions
5. **ETH Loss**: All transfers use low-level call with checks

### Best Practices Implemented

- ✅ NatSpec documentation on all functions
- ✅ Comprehensive error messages
- ✅ Proper event emissions
- ✅ Overflow/underflow protected (Solidity 0.8+)
- ✅ Emergency withdrawal functions
- ✅ Owner-controlled configuration

### Recommended Audits

Before mainnet deployment:

1. Professional smart contract audit
2. Formal verification of bonding curve math
3. Slither/Mythril security scanning
4. Gas optimization review

## Usage Examples

### Create Agent with Token

```solidity
Factory factory = Factory(factoryAddress);
(uint256 agentId, address tokenAddress) = factory.createAgentWithToken(
    "My AI Agent",
    "Specialized in content creation",
    "writing",
    "My Token",
    "MYT"
);
```

### Buy via Bonding Curve

```solidity
BondingCurve curve = BondingCurve(curveAddress);
uint256 price = curve.getBuyPrice(tokenAddress, 100 * 1e18);
curve.buy{value: price}(tokenAddress, 100 * 1e18);
```

### Create Marketplace Order

```solidity
Marketplace market = Marketplace(marketplaceAddress);
uint256 orderId = market.createOrder(
    tokenAddress,
    1000 * 1e18,  // amount
    0.01 ether    // price per token
);
```

### Buy from Marketplace

```solidity
uint256 totalPrice = 100 * 1e18 * 0.01 ether;
market.buyFromOrder{value: totalPrice}(orderId, 100 * 1e18);
```

## Gas Optimization

### Estimated Gas Costs

| Operation | Gas | Cost (ETH @ 50 gwei) |
|-----------|-----|----------------------|
| Create Agent | 85,000 | 0.00425 |
| Create Agent + Token | 350,000 | 0.0175 |
| Buy via Bonding Curve | 120,000 | 0.006 |
| Sell via Bonding Curve | 100,000 | 0.005 |
| Create Marketplace Order | 95,000 | 0.00475 |
| Buy from Order | 125,000 | 0.00625 |

## License

MIT

## Support

For questions or issues:
- Create a GitHub issue
- Review NatSpec documentation in contracts
- Check test files for usage examples
