# AI Agents Marketplace - Multi-Chain DApp

A comprehensive multi-chain AI Agents Marketplace where users can create, trade, and govern AI agents using blockchain technology.

## 🏗 Project Structure

```
ai-marketplace/
├── frontend/              # Next.js 14 React app
│   ├── src/
│   │   ├── app/          # App router pages
│   │   ├── components/   # Reusable React components
│   │   ├── hooks/        # Custom React hooks (useAgent, useMarketplace, etc.)
│   │   ├── services/     # API client
│   │   ├── store/        # Zustand state management
│   │   ├── types/        # TypeScript types
│   │   ├── config/       # Configuration (chains, constants)
│   │   └── styles/       # Global CSS
│   ├── next.config.js
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── backend/               # Express.js Node API
│   ├── src/
│   │   ├── api/          # Route handlers
│   │   │   ├── agents/
│   │   │   ├── marketplace/
│   │   │   ├── portfolio/
│   │   │   ├── inference/
│   │   │   ├── governance/
│   │   │   └── health/
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Express middleware
│   │   ├── models/       # Database models (TypeORM)
│   │   ├── blockchain/   # Blockchain interaction
│   │   ├── config/       # Configuration
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Utilities (logger, etc.)
│   ├── app.ts           # Express app setup
│   ├── index.ts         # Server entry point
│   ├── tsconfig.json
│   └── .env.example
│
├── contracts/            # Foundry Smart Contracts
│   ├── src/
│   │   ├── Agent.sol         # ERC-721 Agent NFT
│   │   ├── AgentToken.sol    # Per-agent ERC-20 token
│   │   ├── BondingCurve.sol  # Token pricing & trading
│   │   └── ...other contracts
│   ├── test/             # Solidity tests
│   ├── script/           # Deployment scripts
│   ├── foundry.toml
│   └── README.md
│
├── shared/               # Shared types & utils
│   ├── src/
│   │   ├── types.ts     # Shared TypeScript types
│   │   └── index.ts
│   └── tsconfig.json
│
└── package.json          # Monorepo root (npm workspaces)
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- npm >= 9
- Foundry (for smart contracts)
- Docker (optional, for local database)

### Installation

```bash
# Clone repository
git clone <repo-url>
cd ai-marketplace

# Install dependencies
npm install

# Setup environment files
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

### Running Locally

```bash
# Development mode (frontend + backend together)
npm run dev

# Or run separately:
npm run dev -w frontend  # Next.js on http://localhost:3000
npm run dev -w backend   # Express on http://localhost:3001
```

### Smart Contracts

```bash
# Compile contracts
npm run contracts:compile

# Run tests
npm run contracts:test

# Deploy locally
npm run deploy:local
```

## 📋 Features

### Frontend (Next.js + React)
- **Marketplace**: Browse and filter AI agents
- **Agent Creation**: Mint new AI agents as NFTs
- **Portfolio**: Track your held agents across chains
- **Trading**: Buy/sell agent tokens via bonding curve
- **Inference**: Run prompts against agents
- **Governance**: Stake veVIRTUAL and vote on proposals
- **Multi-chain Support**: Seamlessly switch between Ethereum, Polygon, Arbitrum, Base

### Backend (Express.js)
- **RESTful API**: Well-structured endpoints for all features
- **Database**: PostgreSQL for persistent data
- **Caching**: Redis for performance
- **Blockchain Integration**: Multi-chain RPC interaction
- **Indexing**: Listen to contract events across chains
- **LLM Integration**: Support for OpenAI, Anthropic APIs
- **Error Handling**: Comprehensive error handling and logging

### Smart Contracts (Foundry)
- **Agent NFT**: ERC-721 for agent ownership
- **Agent Tokens**: ERC-20 per agent for trading
- **Bonding Curve**: Automated market maker for pricing
- **Governance**: veVIRTUAL staking and voting
- **Multi-chain**: Deploy to Ethereum, Polygon, Arbitrum, Base

## 🔧 API Endpoints

### Agents
- `GET /api/agents` - List all agents
- `GET /api/agents/:id` - Get agent details
- `POST /api/agents` - Create new agent
- `PATCH /api/agents/:id` - Update agent

### Marketplace
- `GET /api/marketplace/trades/:agentId` - Get trade history
- `GET /api/marketplace/price/:agentId` - Get market price

### Portfolio
- `GET /api/portfolio/:userAddress` - Get user portfolio
- `GET /api/portfolio/:userAddress/value` - Get portfolio value

### Inference
- `POST /api/inference/run` - Run agent inference

### Governance
- `GET /api/governance/proposals` - List proposals
- `GET /api/governance/voting-power/:userAddress` - Get voting power

### Health
- `GET /health` - Health check

## 🔐 Security Considerations

- All blockchain interactions verified with signatures
- Input validation at API boundaries
- SQL injection prevention with parameterized queries
- XSS protection with helmet.js
- CORS configured for production
- Environment secrets managed via .env files

## 📚 Tech Stack

### Frontend
- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Queries**: TanStack Query
- **Blockchain**: wagmi + viem
- **Charts**: Recharts

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL + TypeORM
- **Cache**: Redis
- **Logging**: Winston
- **Validation**: Zod

### Smart Contracts
- **Language**: Solidity 0.8.20
- **Framework**: Foundry
- **Standards**: OpenZeppelin ERC721/ERC20
- **Testing**: Foundry Test Framework

## 🌐 Supported Networks

- Ethereum Mainnet
- Polygon
- Arbitrum One
- Base

## 📖 Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=ai_marketplace
REDIS_URL=redis://localhost:6379
ETH_RPC_URL=https://eth.public.io
POLYGON_RPC_URL=https://polygon-rpc.com
ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc
BASE_RPC_URL=https://mainnet.base.org
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_ETH_RPC=https://eth.public.io
NEXT_PUBLIC_POLYGON_RPC=https://polygon-rpc.com
NEXT_PUBLIC_ARB_RPC=https://arb1.arbitrum.io/rpc
NEXT_PUBLIC_BASE_RPC=https://mainnet.base.org
```

## 🚢 Deployment

### Frontend (Vercel)
```bash
npm run build -w frontend
# Deploy dist directory to Vercel
```

### Backend (Docker)
```bash
docker build -t ai-marketplace-backend ./backend
docker run -p 3001:3001 --env-file .env ai-marketplace-backend
```

### Smart Contracts
```bash
forge script script/Deploy.s.sol --rpc-url $RPC_URL --broadcast --verify
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request
4. Code review and merge

## 📄 License

MIT

## 📧 Support

For issues and questions, please open a GitHub issue or contact the team.

---

Happy building! 🚀
