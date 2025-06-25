import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Absence {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column()
  date: string;

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @Column()
  description: string;

  @Column()
  status: string;
  
  @ManyToOne(() => User, user => user.absences, { onDelete: 'CASCADE' })
  user: User;
}