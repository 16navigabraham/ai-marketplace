# Quick Start Guide

Get the AI Marketplace backend running in minutes.

## Prerequisites

- Node.js 18+
- PostgreSQL 13+ (or Docker)
- Git

## 1. Setup Local PostgreSQL (Optional - Use Docker)

```bash
# Using Docker (easiest)
docker run -d \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ai_marketplace \
  -p 5432:5432 \
  postgres:15
```

Or install PostgreSQL locally and create database:
```sql
CREATE DATABASE ai_marketplace;
```

## 2. Install Dependencies

```bash
cd backend
npm install
```

## 3. Configure Environment

```bash
cp .env.example .env
```

Update `.env` with your settings (minimal for local dev):

```env
NODE_ENV=development
PORT=3001
LOG_LEVEL=debug

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=ai_marketplace

ETH_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/demo
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/demo
ARBITRUM_RPC_URL=https://arb-mainnet.g.alchemy.com/v2/demo
BASE_RPC_URL=https://mainnet.base.org

CORS_ORIGIN=http://localhost:3000
```

## 4. Start Server

```bash
npm run dev
```

Expected output:
```
[info]: Database connection established
[info]: Server running on http://localhost:3001
[info]: Environment: development
```

## 5. Seed Sample Data (Optional)

In a new terminal:
```bash
npx ts-node src/database/seed.ts
```

## 6. Test the API

### Health Check
```bash
curl http://localhost:3001/health
```

### List Agents
```bash
curl http://localhost:3001/api/agents
```

### Create an Agent
```bash
curl -X POST http://localhost:3001/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My AI Agent",
    "description": "A test AI agent",
    "creatorAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42aE0",
    "type": "writing",
    "chains": ["ethereum"]
  }'
```

Expected response:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "My AI Agent",
  "description": "A test AI agent",
  "creatorAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42aE0",
  "type": "writing",
  "chains": ["ethereum"],
  "marketCap": "0",
  "createdAt": "2024-01-10T12:00:00.000Z",
  "updatedAt": "2024-01-10T12:00:00.000Z"
}
```

### Get Portfolio (Empty initially)
```bash
curl http://localhost:3001/api/portfolio/0x742d35Cc6634C0532925a3b844Bc9e7595f42aE0
```

### Run Inference
```bash
curl -X POST http://localhost:3001/api/inference/run \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "550e8400-e29b-41d4-a716-446655440000",
    "prompt": "Write a haiku about blockchain",
    "type": "writing"
  }'
```

## Common Commands

```bash
# Development server with hot reload
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build

# Run production build
npm start

# Lint code
npm run lint
```

## Database Commands

```bash
# View logs (development mode)
tail -f logs/combined.log

# Connect to PostgreSQL
psql -U postgres -d ai_marketplace

# List tables
\dt

# Exit psql
\q
```

## Troubleshooting

### Port Already in Use
```bash
# Change PORT in .env
PORT=3002
```

### Database Connection Failed
```bash
# Check PostgreSQL is running
psql -U postgres -d ai_marketplace

# Or start Docker container
docker ps | grep postgres
docker start <container_id>
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
# Run type check
npm run type-check

# Clear build artifacts
rm -rf dist tsconfig.tsbuildinfo
npm run build
```

## API Endpoints

### Agents
- `GET /api/agents` - List all agents
- `GET /api/agents/:id` - Get agent details
- `POST /api/agents` - Create agent
- `PATCH /api/agents/:id` - Update agent

### Marketplace
- `GET /api/marketplace/trades/:agentId` - Get trades
- `GET /api/marketplace/price/:agentTokenId` - Get price
- `POST /api/marketplace/quote/buy` - Buy quote
- `POST /api/marketplace/quote/sell` - Sell quote

### Portfolio
- `GET /api/portfolio/:userAddress` - Get portfolio
- `GET /api/portfolio/:userAddress/value` - Portfolio value
- `POST /api/portfolio/:userAddress/holdings` - Add holding

### Inference
- `POST /api/inference/run` - Run inference
- `POST /api/inference/batch` - Batch inference

### Governance
- `GET /api/governance/proposals` - List proposals
- `GET /api/governance/voting-power/:userAddress` - Voting power

See [API_REFERENCE.md](./API_REFERENCE.md) for complete documentation.

## What's Implemented

✅ Complete REST API with 25+ endpoints
✅ PostgreSQL database with 5 tables
✅ Bonding curve pricing for token trading
✅ Portfolio management with value tracking
✅ LLM inference (Claude/OpenAI) with mock fallback
✅ Multi-chain blockchain support
✅ Governance proposals and voting
✅ Input validation with Zod
✅ Error handling and logging
✅ Production-ready code

## Next Steps

1. **Read the docs**
   - [BACKEND_SETUP.md](./BACKEND_SETUP.md) - Detailed setup guide
   - [API_REFERENCE.md](./API_REFERENCE.md) - Complete API documentation
   - [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Technical overview

2. **Configure services**
   - Add blockchain RPC URLs
   - Configure LLM API keys (Claude/OpenAI)
   - Update PostgreSQL credentials

3. **Deploy**
   - Set up production database
   - Configure environment variables
   - Deploy to your infrastructure

## Support

### View Server Logs
```bash
# Development (console)
npm run dev

# Production (file)
tail -f logs/error.log
```

### Database Queries
```bash
# Connect to database
psql -U postgres -d ai_marketplace

# View agents
SELECT id, name, type, "creatorAddress" FROM agents;

# View trades
SELECT id, "agentId", buyer, seller, amount FROM trades;

# View portfolios
SELECT id, "userAddress", "agentId", balance FROM portfolios;
```

### Check Health
```bash
curl http://localhost:3001/health
# Expected: {"status":"ok","timestamp":"...","uptime":...}
```

---

**Need help?** Check the [API_REFERENCE.md](./API_REFERENCE.md) or review the error logs.
