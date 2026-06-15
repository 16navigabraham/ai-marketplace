# Synapse: Delegated AI Agent Reputation System

Built for the **MetaMask Smart Accounts Kit × 1Shot API × Venice AI Dev Cook-Off Hackathon (June 2026)**.

---

## The Core Challenge
Autonomous AI agents are increasingly entrusted with user wallets to execute on-chain actions (trading, staking, voting) via delegated smart accounts. However, this creates a severe trust bottleneck:
1. **Model Drift & Behavior Changes:** Operators can silently swap model prompts or modify agent parameters post-launch to run malicious transactions.
2. **Lack of Alignment:** Users carry 100% of the financial risk when authorizing delegations, while operators face no downside for bugs or exploit vectors.
3. **Fragile UX:** Requiring users to continuously claim testnet gas tokens and USDC faucets across multiple chains makes early testing slow and disjointed.

---

## The Synapse Solution

Synapse introduces a delegated AI agent reputation and trust-co-ownership protocol that turns trust into a tokenized asset.

### 1. Reputation-as-Asset (Staking & Slashing)
Each agent is assigned a reputation score (0–1000) and moves through reputation tiers:
$$\text{Unverified} \longrightarrow \text{Provisional} \longrightarrow \text{Trusted} \longrightarrow \text{Elite}$$

Stakers back an agent's reputation by staking USDC directly onto the agent's profile.
- **Economic Alignment:** Stakers earn a share of the agent's inference and execution fees.
- **Reputation Slashing:** If an agent executes a malicious operation or violates its Character Card limits, stakers face slashing.

### 2. Immutable Character Cards & Configuration Snapshots
When an operator registers an agent NFT, they must submit a **Character Card**:
- Allowed targets (approved contract addresses)
- Operational boundaries (max spending caps)
- Permitted action types

To prevent silent prompt injections or developer updates from altering agent behavior, this profile is locked on-chain in the `AgentRegistry` until it achieves "Trusted" status.

### 3. Venice AI Planning & Scoped Execution
Synapse utilizes Venice AI to parse user goals and generate structured plans:
- **High-Level Planner:** Analyzes the target goal and verifies it against the agent's allowed parameters.
- **Low-Level Planner:** Breaks down goals into specific 1Shot API execution bundles.
- **Validation:** Transactions are validated against EIP-7715/EIP-7710 delegation rules and processed gaslessly using MetaMask Smart Accounts.

### 4. Zero-Friction Testnet Faucet
To remove developer and user testing friction, Synapse features a background auto-faucet. The app automatically checks the user's Smart Account USDC balance on login and calls the backend faucet to transfer 100 testnet USDC on Base Sepolia.

---

## Technical Architecture

### Smart Contracts (`contracts/src/`)
- **`AgentRegistry.sol`**: Manages agent NFT registry, lifecycle statuses (PENDING, ACTIVE, SUSPENDED), and configuration locking.
- **`DelegationManager.sol`**: Manages and enforces EIP-7715/7710 delegated rules.
- **`ReputationScore.sol`**: Keeps metrics of task success, disputes, and updates tiers.
- **`TrustStaking.sol`**: Manages USDC backing deposits and slashing.
- **`Treasury.sol`**: Receives a 1% staking fee to fund audit bounties.

### Backend & AI Reasoning (`backend/src/`)
- **`VeniceReasoningService.ts`**: Handles Venice AI planning logic and goal interpretation.
- **`ReputationService.ts`**: Aggregates scoring details and handles stake accounting.
- **`routes.ts`**: Exposes `/api/reputation/*` endpoints.

### Frontend Dashboard (`frontend/src/`)
- **`CreateAgentPage`**: Onboarding form with spending limits, actions scope, and snapshot locks.
- **`ReputationStakingPanel`**: Trust scorecard and staking interface on the agent detail page.
- **`RunAgentPanel`**: Redesigned as an interactive chat terminal displaying the agent's reputation tier.
