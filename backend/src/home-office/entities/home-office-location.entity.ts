import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/user.entity';

@Entity()
export class HomeOfficeLocation {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column()
  name: string;

  @Column('float')
  lat: number;

  @Column('float')
  lng: number;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => User)
  user: User;
}