import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeOfficeController } from './home-office.controller';
import { HomeOfficeService } from './home-office.service';
import { HomeOfficeLocation } from './entities/home-office-location.entity';
import { HomeOfficeRequest } from './entities/home-office-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HomeOfficeLocation, HomeOfficeRequest])],
  controllers: [HomeOfficeController],
  providers: [HomeOfficeService],
  exports: [HomeOfficeService],
})
export class HomeOfficeModule {}