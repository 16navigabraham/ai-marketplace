import { logger } from '@/utils/logger';

export interface AgentReputation {
  agentId: string;
  score: number;
  tier: 'Unverified' | 'Provisional' | 'Trusted' | 'Elite';
  totalStaked: string;
  disputes: number;
  successCount: number;
}

export class ReputationService {
  // Simulation of agent reputations for local testing
  private reputations: Map<string, AgentReputation> = new Map();

  constructor() {
    // Seed default agent reputations aligning with mock database agents
    this.reputations.set('601110dd-9994-4908-99c6-83d0469be110', {
      agentId: '601110dd-9994-4908-99c6-83d0469be110',
      score: 950,
      tier: 'Elite',
      totalStaked: '12500000', // USDC units
      disputes: 0,
      successCount: 142,
    });
    this.reputations.set('15566dad-6d37-4271-8f6b-3e03ce699f30', {
      agentId: '15566dad-6d37-4271-8f6b-3e03ce699f30',
      score: 720,
      tier: 'Trusted',
      totalStaked: '5000000',
      disputes: 1,
      successCount: 89,
    });
    this.reputations.set('fa64fb13-e895-42da-9001-b0147191b070', {
      agentId: 'fa64fb13-e895-42da-9001-b0147191b070',
      score: 410,
      tier: 'Provisional',
      totalStaked: '1500000',
      disputes: 3,
      successCount: 34,
    });
    this.reputations.set('fa963c9f-0eb4-4014-84a8-5055f8c2f0dd', {
      agentId: 'fa963c9f-0eb4-4014-84a8-5055f8c2f0dd',
      score: 280,
      tier: 'Unverified',
      totalStaked: '0',
      disputes: 5,
      successCount: 12,
    });
  }

  async getReputation(agentId: string): Promise<AgentReputation> {
    if (!this.reputations.has(agentId)) {
      const newRep: AgentReputation = {
        agentId,
        score: 500,
        tier: 'Provisional',
        totalStaked: '0',
        disputes: 0,
        successCount: 0,
      };
      this.reputations.set(agentId, newRep);
    }
    return this.reputations.get(agentId)!;
  }

  async stakeReputation(agentId: string, amount: string): Promise<AgentReputation> {
    const rep = await this.getReputation(agentId);
    const current = BigInt(rep.totalStaked);
    const added = BigInt(amount);
    rep.totalStaked = (current + added).toString();

    // Staking deposits strengthen the reputation score slightly
    if (rep.score + 5 <= 1000) {
      rep.score += 5;
      this.updateTier(rep);
    }

    this.reputations.set(agentId, rep);
    return rep;
  }

  async reportMisbehavior(agentId: string): Promise<AgentReputation> {
    const rep = await this.getReputation(agentId);
    rep.disputes++;
    if (rep.score >= 50) {
      rep.score -= 50;
    } else {
      rep.score = 0;
    }
    this.updateTier(rep);
    this.reputations.set(agentId, rep);
    return rep;
  }

  private updateTier(rep: AgentReputation) {
    if (rep.score >= 900) {
      rep.tier = 'Elite';
    } else if (rep.score >= 700) {
      rep.tier = 'Trusted';
    } else if (rep.score >= 300) {
      rep.tier = 'Provisional';
    } else {
      rep.tier = 'Unverified';
    }
  }
}
