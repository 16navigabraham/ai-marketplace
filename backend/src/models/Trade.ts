import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { Agent } from './Agent';

@Entity('trades')
@Index(['agentId', 'createdAt'])
@Index(['buyer'])
@Index(['seller'])
@Index(['txHash'])
export class Trade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  agentId: string;

  @Column({ type: 'varchar', length: 42 })
  buyer: string;

  @Column({ type: 'varchar', length: 42 })
  seller: string;

  @Column({ type: 'numeric', precision: 38, scale: 18 })
  amount: string;

  @Column({ type: 'numeric', precision: 38, scale: 18 })
  price: string;

  @Column({ type: 'numeric', precision: 38, scale: 18 })
  totalValue: string;

  @Column({ type: 'varchar', length: 50 })
  chain: string;

  @Column({ type: 'varchar', length: 100 })
  txHash: string;

  @Column({ type: 'enum', enum: ['buy', 'sell'] })
  type: 'buy' | 'sell';

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => Agent, (agent) => agent.trades, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agentId' })
  agent: Agent;
}
