import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPreferences } from './entities/user-preference.entity';
import { User } from '../users/user.entity';

@Injectable()
export class UserPreferencesService {
  constructor(
    @InjectRepository(UserPreferences)
    private readonly userPreferencesRepository: Repository<UserPreferences>,
  ) {}

  async getByUser(user: User): Promise<UserPreferences> {
    let preferences = await this.userPreferencesRepository.findOne({ where: { user: { id: user.id } } });
    
    if (!preferences) {
      preferences = await this.create({
        theme: 'light',
        language: 'en',
        notifications: true
      }, user);
    }
    
    return preferences;
  }

  async create(preferencesData: Partial<UserPreferences>, user: User): Promise<UserPreferences> {
    const preferences = this.userPreferencesRepository.create({
      ...preferencesData,
      user
    });
    
    return this.userPreferencesRepository.save(preferences);
  }

  async update(preferencesData: Partial<UserPreferences>, user: User): Promise<UserPreferences> {
    let preferences = await this.getByUser(user);
    
    Object.assign(preferences, preferencesData);
    return this.userPreferencesRepository.save(preferences);
  }

  async reset(user: User): Promise<UserPreferences> {
    let preferences = await this.getByUser(user);
    
    preferences.theme = 'light';
    preferences.language = 'en';
    preferences.notifications = true;
    
    return this.userPreferencesRepository.save(preferences);
  }
}