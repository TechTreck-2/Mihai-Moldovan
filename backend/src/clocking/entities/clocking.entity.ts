import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/user.entity';

@Entity()
export class Clocking {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column()
  date: string;

  @Column()
  startTime: string;

  @Column({ nullable: true })
  endTime: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 'active' })
  status: string;  // 'active' | 'completed' | 'modified'
  
  @ManyToOne(() => User, user => user.clockings, { onDelete: 'CASCADE' })
  user: User;
}