import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1704067200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "address" character varying(42) PRIMARY KEY,
        "ensName" character varying,
        "username" character varying,
        "profileImage" character varying,
        "bio" text,
        "metadata" jsonb DEFAULT '{}',
        "totalPortfolioValue" numeric(38,18) DEFAULT '0',
        "isVerified" boolean DEFAULT false,
        "createdAt" TIMESTAMP DEFAULT now(),
        "updatedAt" TIMESTAMP DEFAULT now()
      )
    `);

    // Create agents table
    await queryRunner.query(`
      CREATE TABLE "agents" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" character varying(255) NOT NULL,
        "description" text NOT NULL,
        "creatorAddress" character varying(42) NOT NULL,
        "type" character varying NOT NULL,
        "avatarUrl" character varying,
        "tokenAddresses" jsonb DEFAULT '{}',
        "chains" text[],
        "totalHolders" bigint DEFAULT 0,
        "marketCap" numeric(38,18) DEFAULT '0',
        "createdAt" TIMESTAMP DEFAULT now(),
        "updatedAt" TIMESTAMP DEFAULT now()
      )
    `);

    // Create indexes for agents
    await queryRunner.query(`CREATE INDEX "IDX_agents_creatorAddress" ON "agents"("creatorAddress")`);
    await queryRunner.query(`CREATE INDEX "IDX_agents_type" ON "agents"("type")`);
    await queryRunner.query(`CREATE INDEX "IDX_agents_createdAt" ON "agents"("createdAt")`);

    // Create agent_tokens table
    await queryRunner.query(`
      CREATE TABLE "agent_tokens" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "agentId" uuid NOT NULL,
        "chain" character varying(50) NOT NULL,
        "contractAddress" character varying(42) NOT NULL,
        "totalSupply" numeric(38,18) DEFAULT '0',
        "circulatingSupply" numeric(38,18) DEFAULT '0',
        "price" numeric(38,18) DEFAULT '0',
        "marketCap" numeric(38,18) DEFAULT '0',
        "priceChange24h" numeric(18,2) DEFAULT 0,
        "volume24h" numeric(38,18) DEFAULT '0',
        "createdAt" TIMESTAMP DEFAULT now(),
        "updatedAt" TIMESTAMP DEFAULT now(),
        FOREIGN KEY("agentId") REFERENCES "agents"("id") ON DELETE CASCADE
      )
    `);

    // Create unique index for agent_tokens
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_agent_tokens_agentId_chain" ON "agent_tokens"("agentId", "chain")`
    );
    await queryRunner.query(`CREATE INDEX "IDX_agent_tokens_contractAddress" ON "agent_tokens"("contractAddress")`);

    // Create trades table
    await queryRunner.query(`
      CREATE TABLE "trades" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "agentId" uuid NOT NULL,
        "buyer" character varying(42) NOT NULL,
        "seller" character varying(42) NOT NULL,
        "amount" numeric(38,18) NOT NULL,
        "price" numeric(38,18) NOT NULL,
        "totalValue" numeric(38,18) NOT NULL,
        "chain" character varying(50) NOT NULL,
        "txHash" character varying(100) NOT NULL,
        "type" character varying NOT NULL,
        "createdAt" TIMESTAMP DEFAULT now(),
        FOREIGN KEY("agentId") REFERENCES "agents"("id") ON DELETE CASCADE
      )
    `);

    // Create indexes for trades
    await queryRunner.query(`CREATE INDEX "IDX_trades_agentId_createdAt" ON "trades"("agentId", "createdAt")`);
    await queryRunner.query(`CREATE INDEX "IDX_trades_buyer" ON "trades"("buyer")`);
    await queryRunner.query(`CREATE INDEX "IDX_trades_seller" ON "trades"("seller")`);
    await queryRunner.query(`CREATE INDEX "IDX_trades_txHash" ON "trades"("txHash")`);

    // Create portfolios table
    await queryRunner.query(`
      CREATE TABLE "portfolios" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "userAddress" character varying(42) NOT NULL,
        "agentId" uuid NOT NULL,
        "agentTokenId" uuid,
        "chain" character varying(50) NOT NULL,
        "balance" numeric(38,18) DEFAULT '0',
        "currentPrice" numeric(38,18) DEFAULT '0',
        "currentValue" numeric(38,18) DEFAULT '0',
        "averageBuyPrice" numeric(38,18) DEFAULT '0',
        "createdAt" TIMESTAMP DEFAULT now(),
        "updatedAt" TIMESTAMP DEFAULT now(),
        FOREIGN KEY("userAddress") REFERENCES "users"("address") ON DELETE CASCADE,
        FOREIGN KEY("agentId") REFERENCES "agents"("id") ON DELETE CASCADE,
        FOREIGN KEY("agentTokenId") REFERENCES "agent_tokens"("id") ON DELETE SET NULL
      )
    `);

    // Create indexes for portfolios
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_portfolios_userAddress_agentId_chain" ON "portfolios"("userAddress", "agentId", "chain")`
    );
    await queryRunner.query(`CREATE INDEX "IDX_portfolios_userAddress" ON "portfolios"("userAddress")`);
    await queryRunner.query(`CREATE INDEX "IDX_portfolios_agentId" ON "portfolios"("agentId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop all tables in reverse order
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_portfolios_agentId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_portfolios_userAddress"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_portfolios_userAddress_agentId_chain"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "portfolios"`);

    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_trades_txHash"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_trades_seller"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_trades_buyer"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_trades_agentId_createdAt"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "trades"`);

    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_agent_tokens_contractAddress"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_agent_tokens_agentId_chain"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "agent_tokens"`);

    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_agents_createdAt"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_agents_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_agents_creatorAddress"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "agents"`);

    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
