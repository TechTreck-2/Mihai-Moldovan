import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Holiday {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column()
  startDate: string;

  @Column()
  endDate: string;

  @Column()
  holidayName: string;
  
  @ManyToOne(() => User, user => user.holidays, { onDelete: 'CASCADE' })
  user: User;
}