import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Holiday } from '../holiday/holiday.entity';
import { Absence } from 'src/absence/absence.entity';
import { Clocking } from 'src/clocking/entities/clocking.entity';
import { UserPreferences } from 'src/user-preferences/entities/user-preference.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @OneToMany(() => Holiday, (holiday) => holiday.user, {
    cascade: true,
  })
  holidays: Holiday[];

  @OneToMany(() => Absence, (absence) => absence.user)
  absences: Absence[];

  @OneToMany(() => Clocking, (clocking) => clocking.user)
  clockings: Clocking[];

  @OneToOne(() => UserPreferences, (preferences) => preferences.user, {
    cascade: true,
  })
  preferences: UserPreferences;
}
