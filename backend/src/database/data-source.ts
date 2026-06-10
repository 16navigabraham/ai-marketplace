import { DataSource } from 'typeorm';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';

// Import entities
import { Agent } from '@/models/Agent';
import { AgentToken } from '@/models/AgentToken';
import { Trade } from '@/models/Trade';
import { Portfolio } from '@/models/Portfolio';
import { User } from '@/models/User';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  synchronize: env.NODE_ENV === 'development',
  logging: env.NODE_ENV === 'development',
  entities: [Agent, AgentToken, Trade, Portfolio, User],
  migrations: ['src/database/migrations/*.ts'],
  subscribers: ['src/database/subscribers/*.ts'],
});

export async function initializeDatabase() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info('Database connection established');
    }
  } catch (error) {
    logger.error('Database initialization failed:', error);
    throw error;
  }
}

export async function closeDatabase() {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info('Database connection closed');
    }
  } catch (error) {
    logger.error('Database closure failed:', error);
  }
}
