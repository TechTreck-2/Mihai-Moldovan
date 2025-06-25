import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/user.entity';

@Entity()
export class HomeOfficeRequest {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column()
  startDate: string;

  @Column()
  endDate: string;

  @Column()
  location: string;

  @Column()
  reason: string;

  @Column()
  status: 'pending' | 'approved' | 'rejected';

  @ManyToOne(() => User)
  user: User;
}