import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ClockingService } from './clocking.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Clocking } from './entities/clocking.entity';

@Controller('clockings')
@UseGuards(JwtAuthGuard)
export class ClockingController {
  constructor(private readonly clockingService: ClockingService) {}

  @Get()
  getAllClockings(@Request() req) {
    return this.clockingService.getAll(req.user);
  }

  @Get('date')
  getClockingsByDate(@Query('date') date: string, @Request() req) {
    return this.clockingService.findByDate(date, req.user);
  }

  @Get('active')
  getActiveClocking(@Request() req) {
    return this.clockingService.findActive(req.user);
  }

  @Post()
  createClocking(@Body() clocking: Clocking, @Request() req) {
    return this.clockingService.create(clocking, req.user);
  }

  @Post('clock-in')
  clockIn(@Request() req) {
    const now = new Date();
    const clocking = new Clocking();
    clocking.date = now.toISOString().split('T')[0];
    clocking.startTime = now.toISOString();
    clocking.status = 'active';
    
    return this.clockingService.create(clocking, req.user);
  }

  @Post('clock-out')
  clockOut(@Request() req) {
    return this.clockingService.completeActive(req.user);
  }

  @Put(':id')
  updateClocking(@Param('id') id: number, @Body() clocking: Partial<Clocking>, @Request() req) {
    return this.clockingService.update(id, clocking, req.user);
  }

  @Delete(':id')
  deleteClocking(@Param('id') id: number, @Request() req) {
    return this.clockingService.delete(id, req.user);
  }
}