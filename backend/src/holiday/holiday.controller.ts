import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { HolidayService } from './holiday.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Holiday } from './holiday.entity';

@Controller('holidays')
@UseGuards(JwtAuthGuard)
export class HolidayController {
  constructor(private readonly holidayService: HolidayService) {}

  @Get()
  getAllHolidays(@Request() req) {
    return this.holidayService.getAll(req.user);
  }

  @Post()
  createHoliday(@Body() holiday: Holiday, @Request() req) {
    return this.holidayService.create(holiday, req.user);
  }
  @Put(':id')
  updateHoliday(@Param('id') id: string, @Body() holiday: Partial<Holiday>, @Request() req) {
    return this.holidayService.update(id, holiday, req.user);
  }

  @Delete(':id')
  deleteHoliday(@Param('id') id: string, @Request() req) {
    return this.holidayService.delete(id, req.user);
  }
}