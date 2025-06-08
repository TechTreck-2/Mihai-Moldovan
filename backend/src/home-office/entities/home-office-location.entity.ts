import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/user.entity';

@Entity()
export class HomeOfficeLocation {
  @PrimaryGeneratedColumn()
  id: number;

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