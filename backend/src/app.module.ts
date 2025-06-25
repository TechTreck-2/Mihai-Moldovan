import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HolidayModule } from './holiday/holiday.module';
import { AbsenceModule } from './absence/absence.module';
import { ClockingModule } from './clocking/clocking.module';
import { UserPreferencesModule } from './user-preferences/user-preferences.module';
import { HomeOfficeModule } from './home-office/home-office.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        ssl: {
          rejectUnauthorized: false,
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    HolidayModule,
    AbsenceModule,
    ClockingModule,
    UserPreferencesModule,
    HomeOfficeModule,
  ],
})
export class AppModule {}