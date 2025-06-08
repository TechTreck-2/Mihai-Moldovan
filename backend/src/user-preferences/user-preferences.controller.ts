import { Controller, Get, Put, Body, UseGuards, Request, Post } from '@nestjs/common';
import { UserPreferencesService } from './user-preferences.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserPreferences } from './entities/user-preference.entity';

@Controller('user-preferences')
@UseGuards(JwtAuthGuard)
export class UserPreferencesController {
  constructor(private readonly userPreferencesService: UserPreferencesService) {}

  @Get()
  getUserPreferences(@Request() req) {
    return this.userPreferencesService.getByUser(req.user);
  }

  @Put()
  updateUserPreferences(@Body() preferences: Partial<UserPreferences>, @Request() req) {
    return this.userPreferencesService.update(preferences, req.user);
  }
  
  @Post('reset')
  resetUserPreferences(@Request() req) {
    return this.userPreferencesService.reset(req.user);
  }
}