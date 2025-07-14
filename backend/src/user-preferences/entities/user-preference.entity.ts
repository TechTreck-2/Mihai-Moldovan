import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/user.entity';

@Entity()
export class UserPreferences {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ default: 'light' })
  theme: string;

  @Column({ default: 'en' })
  language: string;

  @Column({ default: true })
  notifications: boolean;

  @Column({ type: 'json', nullable: true })
  additionalSettings: Record<string, any>;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}
