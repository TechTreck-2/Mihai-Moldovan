import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AbsenceController } from './absence.controller';
import { AbsenceService } from './absence.service';
import { Absence } from './absence.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Absence])],
  controllers: [AbsenceController],
  providers: [AbsenceService],
})
export class AbsenceModule {}