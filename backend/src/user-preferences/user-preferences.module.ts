import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPreferencesController } from './user-preferences.controller';
import { UserPreferencesService } from './user-preferences.service';
import { UserPreferences } from './entities/user-preference.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserPreferences])],
  controllers: [UserPreferencesController],
  providers: [UserPreferencesService],
  exports: [UserPreferencesService]
})
export class UserPreferencesModule {}