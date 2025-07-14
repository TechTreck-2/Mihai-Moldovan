import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { HolidayService } from './holiday.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Holiday } from './holiday.entity';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

@Controller('holidays')
@UseGuards(JwtAuthGuard)
export class HolidayController {
  constructor(private readonly holidayService: HolidayService) {}

  @Get()
  getAllHolidays(@Request() req: AuthenticatedRequest) {
    return this.holidayService.getAll(req.user);
  }

  @Post()
  createHoliday(
    @Body() holiday: Holiday,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.holidayService.create(holiday, req.user);
  }
  @Put(':id')
  updateHoliday(
    @Param('id') id: string,
    @Body() holiday: Partial<Holiday>,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.holidayService.update(id, holiday, req.user);
  }

  @Delete(':id')
  deleteHoliday(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.holidayService.delete(id, req.user);
  }
}
