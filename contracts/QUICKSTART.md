# Quick Start Guide - AI Agents Marketplace

Get started with the AI Agents Marketplace smart contracts in minutes.

## Prerequisites

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Clone the repo
cd contracts
```

## Installation

```bash
# Install dependencies
forge install openzeppelin/openzeppelin-contracts
```

## Build & Test

```bash
# Compile contracts
forge build

# Run all tests
forge test -vvv

# Run specific test file
forge test test/Integration.t.sol -vvv

# Generate gas report
forge test --gas-report
```

## Local Testing

### Start Local Node

```bash
# Terminal 1: Start Anvil (local Ethereum node)
anvil
```

### Deploy Locally

```bash
# Terminal 2: Deploy contracts
export PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb476caded87985b85c27cc098a4e
export DEPLOYER_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
```

### Initialize Marketplace

```bash
# After deployment, save these addresses from Deploy.s.sol output
export AGENT_ADDRESS=0x...
export AGENT_TOKEN_ADDRESS=0x...
export BONDING_CURVE_ADDRESS=0x...
export FACTORY_ADDRESS=0x...
export MARKETPLACE_ADDRESS=0x...
export VIRTUAL_ADDRESS=0x...

forge script script/Setup.s.sol --rpc-url http://localhost:8545 --broadcast
```

## Usage Examples

### Create Agent with Token

```solidity
// Using Factory contract
IFactory factory = IFactory(factoryAddress);
(uint256 agentId, address tokenAddress) = factory.createAgentWithToken(
    "My AI Agent",           // name
    "Description here",      // description
    "writing",               // type
    "My Token",              // token name
    "MYT"                    // token symbol
);
```

### Buy Tokens via Bonding Curve

```solidity
// Get price first
IBondingCurve curve = IBondingCurve(bondingCurveAddress);
uint256 tokenAmount = 100 * 1e18;  // 100 tokens
uint256 price = curve.getBuyPrice(tokenAddress, tokenAmount);

// Buy tokens
curve.buy{value: price}(tokenAddress, tokenAmount);
```

### Trade on Marketplace

```solidity
// Create order
IMarketplace market = IMarketplace(marketplaceAddress);
IERC20(tokenAddress).approve(marketplaceAddress, 1000 * 1e18);

uint256 orderId = market.createOrder(
    tokenAddress,
    1000 * 1e18,      // amount
    0.01 ether        // price per token
);

// Buy from order
uint256 buyAmount = 100 * 1e18;
uint256 totalPrice = buyAmount * 0.01 ether;
market.buyFromOrder{value: totalPrice}(orderId, buyAmount);
```

## Contract Addresses

After deployment, save these in your `.env` or frontend config:

```
AGENT_ADDRESS=0x...
AGENT_TOKEN_ADDRESS=0x...
BONDING_CURVE_ADDRESS=0x...
VIRTUAL_ADDRESS=0x...
FACTORY_ADDRESS=0x...
MARKETPLACE_ADDRESS=0x...
```

## Testnet Deployment

### Sepolia (Ethereum Testnet)

```bash
# Get Sepolia RPC and faucet ETH
export ETH_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
export PRIVATE_KEY=your_private_key

forge script script/Deploy.s.sol --rpc-url $ETH_RPC_URL --broadcast --verify
```

### Mumbai (Polygon Testnet)

```bash
export POLYGON_RPC_URL=https://rpc-mumbai.maticvigil.com
export PRIVATE_KEY=your_private_key

forge script script/Deploy.s.sol --rpc-url $POLYGON_RPC_URL --broadcast --verify
```

### Arbitrum Sepolia

```bash
export ARBITRUM_RPC_URL=https://sepolia-rpc.arbitrum.io/rpc
export PRIVATE_KEY=your_private_key

forge script script/Deploy.s.sol --rpc-url $ARBITRUM_RPC_URL --broadcast --verify
```

### Base Sepolia

```bash
export BASE_RPC_URL=https://sepolia.base.org
export PRIVATE_KEY=your_private_key

forge script script/Deploy.s.sol --rpc-url $BASE_RPC_URL --broadcast --verify
```

## Verification

After deployment, verify contracts on Etherscan:

```bash
forge verify-contract \
  --compiler-version v0.8.20 \
  --constructor-args $(cast abi-encode "constructor()" 0x) \
  <CONTRACT_ADDRESS> \
  src/Agent.sol:Agent
```

## Common Operations

### Check Agent Metadata

```solidity
IAgent agent = IAgent(agentAddress);
IAgent.AgentMetadata memory metadata = agent.getAgentMetadata(agentId);

console.log("Name:", metadata.name);
console.log("Creator:", metadata.creator);
console.log("Type:", metadata.agentType);
console.log("Created:", metadata.createdAt);
```

### Get Bonding Curve Price

```solidity
IBondingCurve curve = IBondingCurve(bondingCurveAddress);

uint256 buyPrice = curve.getBuyPrice(tokenAddress, 100 * 1e18);
uint256 sellPrice = curve.getSellPrice(tokenAddress, 100 * 1e18);
uint256 supply = curve.getSupply(tokenAddress);
uint256 reserve = curve.getReserve(tokenAddress);
```

### View Marketplace Orders

```solidity
IMarketplace market = IMarketplace(marketplaceAddress);

// Get all orders for a token
uint256[] memory orderIds = market.getTokenOrders(tokenAddress);

// Get active orders only
uint256[] memory activeOrders = market.getActiveTokenOrders(tokenAddress);

// Get order details
IMarketplace.Order memory order = market.getOrder(orderId);
```

## Troubleshooting

### "Insufficient allowance" Error

Make sure to approve the marketplace/bonding curve before trading:

```solidity
IERC20(tokenAddress).approve(marketplaceAddress, amount);
IERC20(tokenAddress).approve(bondingCurveAddress, amount);
```

### "Invalid token address" Error

Ensure you're using the correct token address from deployment output.

### Deployment Fails

1. Check you have enough ETH for gas
2. Verify RPC URL is correct
3. Ensure PRIVATE_KEY is valid
4. Check network connectivity

## Testing Workflow

```bash
# 1. Write test in test/ directory
# 2. Run test
forge test test/YourTest.t.sol -vv

# 3. Debug if needed
forge test test/YourTest.t.sol -vvv

# 4. Check gas usage
forge test --gas-report | grep YourTest
```

## Gas Optimization Tips

1. **Batching**: Multiple operations in one transaction
2. **Storage**: Minimize state changes
3. **Events**: Only emit necessary data
4. **Math**: Use fixed-point arithmetic where possible

## Key Contract Functions

### Agent (NFT)
- `createAgent(name, description, type)` - Create agent
- `setAgentTokenAddress(tokenId, address)` - Link token
- `getAgentMetadata(tokenId)` - Get agent info

### AgentToken (ERC-20)
- `mint(to, amount)` - Mint tokens (owner)
- `burn(amount)` - Burn your tokens
- `approve(spender, amount)` - Allow spending
- `transfer(to, amount)` - Send tokens

### BondingCurve
- `getBuyPrice(token, amount)` - Price to buy
- `getSellPrice(token, amount)` - Price to sell
- `buy(token, amount)` - Buy tokens
- `sell(token, amount)` - Sell tokens

### Marketplace
- `createOrder(token, amount, price)` - Create order
- `cancelOrder(orderId)` - Cancel order
- `buyFromOrder(orderId, amount)` - Buy from order
- `setFeePercentage(fee)` - Set fee (owner)
- `withdrawFees()` - Claim fees (owner)

### Factory
- `createAgentWithToken(...)` - Create agent + token
- `createTokenForAgent(...)` - Add token to agent
- `getTokenAddress(agentId)` - Get token for agent

## Next Steps

1. Review the full [README.md](README.md)
2. Check [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
3. Run all tests: `forge test -vvv`
4. Explore test files for examples
5. Deploy to testnet
6. Build frontend integration

## Support

For issues:
1. Check test files for usage examples
2. Review NatSpec in contract files
3. See README.md for detailed documentation
4. Run `forge doc` to generate documentation

## License

MIT
