# Quick Start Guide

## Setup

### 1. Install Dependencies

```bash
npm install
```

This installs dependencies for all workspaces (frontend, backend, contracts, shared).

### 2. Setup Environment Files

```bash
# Copy environment templates
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env

# Edit backend/.env with your settings (database, RPC URLs, API keys)
```

## Running the Stack

### Option A: Run Everything Together

```bash
npm run dev
```

This starts both frontend and backend in development mode.

### Option B: Run Separately

**Terminal 1 - Frontend (Next.js)**
```bash
npm run dev -w frontend
# Access at http://localhost:3000
```

**Terminal 2 - Backend (Express)**
```bash
npm run dev -w backend
# Access at http://localhost:3001
```

## Building

```bash
# Build all packages
npm run build

# Build specific package
npm run build -w frontend
npm run build -w backend
```

## Smart Contracts (Foundry)

```bash
# Compile contracts
npm run contracts:compile

# Run tests
npm run contracts:test

# View gas usage
npm run contracts:test -- --gas-report
```

## Database Setup (PostgreSQL)

### Option 1: Docker (Recommended)

```bash
docker run -d \
  --name ai-marketplace-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ai_marketplace \
  -p 5432:5432 \
  postgres:15
```

### Option 2: Local PostgreSQL

```bash
createdb ai_marketplace
psql ai_marketplace < migrations/initial.sql
```

## Redis Setup (Optional but Recommended)

```bash
docker run -d \
  --name ai-marketplace-redis \
  -p 6379:6379 \
  redis:7
```

## Project Structure at a Glance

```
frontend/          → Next.js React app (port 3000)
backend/           → Express.js API (port 3001)
contracts/         → Foundry smart contracts
shared/            → Shared types & utilities
```

## Key Files to Know

**Frontend:**
- `frontend/src/app/page.tsx` - Homepage
- `frontend/src/services/api.ts` - API client
- `frontend/src/store/useAppStore.ts` - Global state

**Backend:**
- `backend/src/app.ts` - Express app setup
- `backend/src/api/` - Route handlers
- `backend/src/config/env.ts` - Configuration

**Contracts:**
- `contracts/src/Agent.sol` - Main NFT contract
- `contracts/src/AgentToken.sol` - Per-agent token
- `contracts/src/BondingCurve.sol` - Pricing curve

## Troubleshooting

### Port Already in Use

```bash
# Frontend port 3000 in use
npm run dev -w frontend -- -p 3001

# Backend port 3001 in use
# Change PORT in backend/.env
```

### Database Connection Failed

1. Verify PostgreSQL is running
2. Check credentials in `backend/.env`
3. Ensure database exists: `createdb ai_marketplace`

### Missing Dependencies

```bash
# Clean reinstall
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. **Frontend**: Start building pages in `frontend/src/app/`
2. **Backend**: Implement services in `backend/src/services/`
3. **Contracts**: Deploy test contracts to local network
4. **Database**: Design and run migrations
5. **Integration**: Connect frontend to backend API

## Documentation

- [README.md](./README.md) - Full project documentation
- [frontend/README.md](./frontend/README.md) - Frontend docs
- [backend/README.md](./backend/README.md) - Backend docs
- [contracts/README.md](./contracts/README.md) - Contracts docs

## Helpful Commands

```bash
# Type checking
npm run type-check

# Linting
npm run lint -w frontend
npm run lint -w backend

# Testing
npm test -w frontend
npm run contracts:test

# View package info
npm list -w frontend
npm list -w backend
```

---

Happy coding! 🚀
