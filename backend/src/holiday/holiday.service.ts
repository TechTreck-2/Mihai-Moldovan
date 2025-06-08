import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Holiday } from './holiday.entity';
import { User } from '../users/user.entity';

@Injectable()
export class HolidayService {
  constructor(
    @InjectRepository(Holiday)
    private readonly holidayRepository: Repository<Holiday>,
  ) {}

  async getAll(user: User): Promise<Holiday[]> {
    return this.holidayRepository.find({ where: { user: { id: user.id } } });
  }

  async create(holiday: Holiday, user: User): Promise<Holiday> {
    const newHoliday = this.holidayRepository.create({ ...holiday, user });
    return this.holidayRepository.save(newHoliday);
  }

  async update(id: number, updatedHoliday: Partial<Holiday>, user: User): Promise<Holiday> {
    const holiday = await this.holidayRepository.findOne({ where: { id, user } });
    if (!holiday) throw new Error('Holiday not found');
    Object.assign(holiday, updatedHoliday);
    return this.holidayRepository.save(holiday);
  }

  async delete(id: number, user: User): Promise<void> {
    const holiday = await this.holidayRepository.findOne({ where: { id, user } });
    if (!holiday) throw new Error('Holiday not found');
    await this.holidayRepository.remove(holiday);
  }
}