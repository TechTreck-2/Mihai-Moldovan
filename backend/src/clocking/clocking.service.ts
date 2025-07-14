import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Clocking } from './entities/clocking.entity';
import { User } from '../users/user.entity';

@Injectable()
export class ClockingService {
  constructor(
    @InjectRepository(Clocking)
    private readonly clockingRepository: Repository<Clocking>,
  ) {}

  async getAll(user: User): Promise<Clocking[]> {
    return this.clockingRepository.find({ where: { user: { id: user.id } } });
  }

  async create(clocking: Clocking, user: User): Promise<Clocking> {
    const newClocking = this.clockingRepository.create({ ...clocking, user });
    return this.clockingRepository.save(newClocking);
  }
  async update(
    id: string,
    updatedClocking: Partial<Clocking>,
    user: User,
  ): Promise<Clocking> {
    const clocking = await this.clockingRepository.findOne({
      where: { id, user: { id: user.id } },
    });
    if (!clocking) throw new Error('Clocking not found');
    Object.assign(clocking, updatedClocking);
    return this.clockingRepository.save(clocking);
  }

  async delete(id: string, user: User): Promise<void> {
    const clocking = await this.clockingRepository.findOne({
      where: { id, user: { id: user.id } },
    });
    if (!clocking) throw new Error('Clocking not found');
    await this.clockingRepository.remove(clocking);
  }

  async findByDate(date: string, user: User): Promise<Clocking[]> {
    return this.clockingRepository.find({
      where: {
        date: date,
        user: { id: user.id },
      },
    });
  }

  async completeActive(user: User): Promise<Clocking> {
    const activeClocking = await this.findActive(user);
    if (!activeClocking) {
      throw new Error('No active clocking found');
    }

    activeClocking.endTime = new Date().toISOString();
    activeClocking.status = 'completed';

    return this.clockingRepository.save(activeClocking);
  }

  async findActive(user: User): Promise<Clocking | null> {
    return this.clockingRepository.findOne({
      where: {
        status: 'active',
        endTime: IsNull(),
        user: { id: user.id },
      },
    });
  }
}
