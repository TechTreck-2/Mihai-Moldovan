import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClockingController } from './clocking.controller';
import { ClockingService } from './clocking.service';
import { Clocking } from './entities/clocking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Clocking])],
  controllers: [ClockingController],
  providers: [ClockingService],
})
export class ClockingModule {}