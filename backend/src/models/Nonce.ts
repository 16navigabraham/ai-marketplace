import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('nonces')
@Index(['nonce'], { unique: true })
@Index(['userAddress'])
@Index(['createdAt'])
export class Nonce {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 128 })
  nonce: string;

  @Column({ type: 'varchar', length: 42 })
  userAddress: string;

  @CreateDateColumn()
  createdAt: Date;
}
