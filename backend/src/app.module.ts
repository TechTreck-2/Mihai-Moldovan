import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HolidayModule } from './holiday/holiday.module';
import { AbsenceModule } from './absence/absence.module';
import { ClockingModule } from './clocking/clocking.module';
import { UserPreferencesModule } from './user-preferences/user-preferences.module';
import { HomeOfficeModule } from './home-office/home-office.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    HolidayModule,
    AbsenceModule,
    ClockingModule,
    UserPreferencesModule,
    HomeOfficeModule
  ],
})
export class AppModule {}