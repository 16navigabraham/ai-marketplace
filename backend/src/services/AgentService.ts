import { Repository } from 'typeorm';
import { AppDataSource } from '@/database/data-source';
import { Agent } from '@/models/Agent';
import { AgentToken } from '@/models/AgentToken';
import { Trade } from '@/models/Trade';
import { logger } from '@/utils/logger';
import { AppError } from '@/middleware/errorHandler';

interface CreateAgentInput {
  name: string;
  description: string;
  creatorAddress: string;
  type: 'writing' | 'research' | 'governance' | 'butler';
  avatarUrl?: string;
  chains: string[];
}

interface UpdateAgentInput {
  name?: string;
  description?: string;
  avatarUrl?: string;
}

export class AgentService {
  private agentRepository: Repository<Agent>;
  private agentTokenRepository: Repository<AgentToken>;
  private tradeRepository: Repository<Trade>;

  constructor() {
    this.agentRepository = AppDataSource.getRepository(Agent);
    this.agentTokenRepository = AppDataSource.getRepository(AgentToken);
    this.tradeRepository = AppDataSource.getRepository(Trade);
  }

  async createAgent(input: CreateAgentInput): Promise<Agent> {
    try {
      const agent = this.agentRepository.create({
        ...input,
        tokenAddresses: {},
      });

      const savedAgent = await this.agentRepository.save(agent);
      logger.info(`Agent created: ${savedAgent.id}`, { creatorAddress: input.creatorAddress });

      return savedAgent;
    } catch (error) {
      logger.error('Failed to create agent:', error);
      throw new AppError('Failed to create agent', 400, 'AGENT_CREATE_ERROR');
    }
  }

  async getAgentById(id: string): Promise<Agent> {
    try {
      const agent = await this.agentRepository.findOne({
        where: { id },
        relations: ['tokens', 'trades'],
      });

      if (!agent) {
        throw new AppError('Agent not found', 404, 'AGENT_NOT_FOUND');
      }

      return agent;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Failed to fetch agent:', error);
      throw new AppError('Failed to fetch agent', 500, 'AGENT_FETCH_ERROR');
    }
  }

  async getAgents(
    page: number = 1,
    limit: number = 20,
    type?: string,
    sortBy: 'createdAt' | 'marketCap' = 'createdAt'
  ) {
    try {
      const skip = (page - 1) * limit;

      let query = this.agentRepository.createQueryBuilder('agent');

      if (type) {
        query = query.where('agent.type = :type', { type });
      }

      const [agents, total] = await query
        .orderBy(`agent.${sortBy}`, 'DESC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      return { agents, total, page, limit };
    } catch (error) {
      logger.error('Failed to fetch agents:', error);
      throw new AppError('Failed to fetch agents', 500, 'AGENTS_FETCH_ERROR');
    }
  }

  async updateAgent(id: string, input: UpdateAgentInput): Promise<Agent> {
    try {
      const agent = await this.getAgentById(id);

      if (input.name) agent.name = input.name;
      if (input.description) agent.description = input.description;
      if (input.avatarUrl) agent.avatarUrl = input.avatarUrl;

      const updated = await this.agentRepository.save(agent);
      logger.info(`Agent updated: ${id}`);

      return updated;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Failed to update agent:', error);
      throw new AppError('Failed to update agent', 500, 'AGENT_UPDATE_ERROR');
    }
  }

  async registerTokenAddress(agentId: string, chain: string, contractAddress: string): Promise<AgentToken> {
    try {
      const agent = await this.getAgentById(agentId);

      // Check if token already exists
      const existingToken = await this.agentTokenRepository.findOne({
        where: { agentId, chain },
      });

      if (existingToken) {
        existingToken.contractAddress = contractAddress;
        return await this.agentTokenRepository.save(existingToken);
      }

      // Create new token
      const token = this.agentTokenRepository.create({
        agentId,
        chain,
        contractAddress,
        totalSupply: '0',
        circulatingSupply: '0',
        price: '0',
        marketCap: '0',
      });

      const savedToken = await this.agentTokenRepository.save(token);
      agent.tokenAddresses[chain] = contractAddress;
      await this.agentRepository.save(agent);

      logger.info(`Token registered for agent ${agentId} on ${chain}`);
      return savedToken;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Failed to register token address:', error);
      throw new AppError('Failed to register token address', 400, 'TOKEN_REGISTER_ERROR');
    }
  }

  async getAgentTokens(agentId: string): Promise<AgentToken[]> {
    try {
      const tokens = await this.agentTokenRepository.find({
        where: { agentId },
        order: { createdAt: 'DESC' },
      });

      return tokens;
    } catch (error) {
      logger.error('Failed to fetch agent tokens:', error);
      throw new AppError('Failed to fetch agent tokens', 500, 'TOKENS_FETCH_ERROR');
    }
  }

  async getTradeHistory(agentId: string, page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;

      const [trades, total] = await this.tradeRepository.findAndCount({
        where: { agentId },
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });

      return { trades, total, page, limit };
    } catch (error) {
      logger.error('Failed to fetch trade history:', error);
      throw new AppError('Failed to fetch trade history', 500, 'TRADES_FETCH_ERROR');
    }
  }

  async recordTrade(
    agentId: string,
    buyer: string,
    seller: string,
    amount: string,
    price: string,
    chain: string,
    txHash: string,
    type: 'buy' | 'sell'
  ): Promise<Trade> {
    try {
      const totalValue = (BigInt(amount) * BigInt(price)).toString();

      const trade = this.tradeRepository.create({
        agentId,
        buyer,
        seller,
        amount,
        price,
        totalValue,
        chain,
        txHash,
        type,
      });

      const savedTrade = await this.tradeRepository.save(trade);
      logger.info(`Trade recorded for agent ${agentId}`, { type, buyer, seller });

      return savedTrade;
    } catch (error) {
      logger.error('Failed to record trade:', error);
      throw new AppError('Failed to record trade', 400, 'TRADE_RECORD_ERROR');
    }
  }
}
