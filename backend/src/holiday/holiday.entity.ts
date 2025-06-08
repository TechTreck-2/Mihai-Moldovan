import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Holiday {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  startDate: string;

  @Column()
  endDate: string;

  @Column()
  holidayName: string;
  
  @ManyToOne(() => User, user => user.holidays, { onDelete: 'CASCADE' })
  user: User;
}