/**
 * Real on-chain Trust Staking + Reputation reads (Base Sepolia).
 *
 * TrustStaking.stake() takes native ETH (payable) — a 1% protocol fee routes to
 * the treasury, the rest is staked behind the agent's on-chain id. Reputation is
 * read from ReputationScore. Both are keyed by the numeric on-chain agent id.
 */

export const TRUST_STAKING_ADDRESS =
  process.env.NEXT_PUBLIC_TRUST_STAKING_ADDRESS || '';
export const REPUTATION_ADDRESS =
  process.env.NEXT_PUBLIC_REPUTATION_ADDRESS || '';

const RPC = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || 'https://sepolia.base.org';

const STAKING_ABI = [
  'function stake(uint256 agentId) payable',
  'function unstake(uint256 agentId, uint256 amount)',
  'function totalStaked(uint256 agentId) view returns (uint256)',
  'function stakes(uint256 agentId, address user) view returns (uint256 amount, uint256 rewardDebt)',
];

const REPUTATION_ABI = [
  'function getReputation(uint256 agentId) view returns (uint256 score, uint8 tier)',
  'function agentReputations(uint256 agentId) view returns (uint256 score, uint8 tier, uint256 taskSuccessCount, uint256 disputeCount, uint256 revocationCount)',
];

const TIERS = ['Unverified', 'Provisional', 'Trusted', 'Elite'];

export interface OnchainReputation {
  score: number;
  tier: string;
  taskSuccessCount: number;
  disputeCount: number;
  totalStakedEth: string;
}

export function stakingEnabled(): boolean {
  return !!TRUST_STAKING_ADDRESS && !!REPUTATION_ADDRESS;
}

/** Read reputation + total staked for an on-chain agent id. */
export async function getOnchainReputation(agentId: string): Promise<OnchainReputation | null> {
  if (!stakingEnabled() || !agentId) return null;
  try {
    const { ethers } = await import('ethers');
    const provider = new ethers.JsonRpcProvider(RPC);
    const rep = new ethers.Contract(REPUTATION_ADDRESS, REPUTATION_ABI, provider);
    const staking = new ethers.Contract(TRUST_STAKING_ADDRESS, STAKING_ABI, provider);

    const [m, staked] = await Promise.all([
      rep.agentReputations(agentId),
      staking.totalStaked(agentId),
    ]);

    return {
      score: Number(m.score),
      tier: TIERS[Number(m.tier)] || 'Unverified',
      taskSuccessCount: Number(m.taskSuccessCount),
      disputeCount: Number(m.disputeCount),
      totalStakedEth: ethers.formatEther(staked),
    };
  } catch {
    return null;
  }
}

/** Stake native ETH behind an agent. `signer` = ethers Wallet on Base Sepolia. */
export async function stakeOnAgent(params: {
  signer: any;
  agentId: string;
  amountEth: string;
}): Promise<{ hash: string }> {
  const { signer, agentId, amountEth } = params;
  if (!stakingEnabled()) throw new Error('Staking is not available.');
  try {
    const { ethers } = await import('ethers');
    const staking = new ethers.Contract(TRUST_STAKING_ADDRESS, STAKING_ABI, signer);
    const value = ethers.parseEther(amountEth);
    const tx = await staking.stake(agentId, { value });
    await tx.wait();
    return { hash: tx.hash };
  } catch (err) {
    const e = err as any;
    if (e?.code === 'ACTION_REJECTED') throw new Error('Transaction rejected.');
    if ((e?.reason || e?.message || '').includes('insufficient funds')) {
      throw new Error('Not enough Base Sepolia ETH. Use the faucet.');
    }
    throw new Error('Staking failed. Please try again.');
  }
}
