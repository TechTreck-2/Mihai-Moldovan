import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Absence } from './absence.entity';
import { User } from '../users/user.entity';

@Injectable()
export class AbsenceService {
  constructor(
    @InjectRepository(Absence)
    private readonly absenceRepository: Repository<Absence>,
  ) {}

  async getAll(user: User): Promise<Absence[]> {
    return this.absenceRepository.find({ where: { user: { id: user.id } } });
  }

  async create(absence: Absence, user: User): Promise<Absence> {
    const newAbsence = this.absenceRepository.create({ ...absence, user });
    return this.absenceRepository.save(newAbsence);
  }

  async update(id: number, updatedAbsence: Partial<Absence>, user: User): Promise<Absence> {
    const absence = await this.absenceRepository.findOne({ where: { id, user } });
    if (!absence) throw new Error('Absence not found');
    Object.assign(absence, updatedAbsence);
    return this.absenceRepository.save(absence);
  }

  async delete(id: number, user: User): Promise<void> {
    const absence = await this.absenceRepository.findOne({ where: { id, user } });
    if (!absence) throw new Error('Absence not found');
    await this.absenceRepository.remove(absence);
  }
}