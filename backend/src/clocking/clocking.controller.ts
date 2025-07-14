import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ClockingService } from './clocking.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Clocking } from './entities/clocking.entity';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

@Controller('clockings')
@UseGuards(JwtAuthGuard)
export class ClockingController {
  constructor(private readonly clockingService: ClockingService) {}

  @Get()
  getAllClockings(@Request() req: AuthenticatedRequest) {
    return this.clockingService.getAll(req.user);
  }

  @Get('date')
  getClockingsByDate(
    @Query('date') date: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.clockingService.findByDate(date, req.user);
  }

  @Get('active')
  getActiveClocking(@Request() req: AuthenticatedRequest) {
    return this.clockingService.findActive(req.user);
  }

  @Post()
  createClocking(
    @Body() clocking: Clocking,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.clockingService.create(clocking, req.user);
  }

  @Post('clock-in')
  clockIn(@Request() req: AuthenticatedRequest) {
    const now = new Date();
    const clocking = new Clocking();
    clocking.date = now.toISOString().split('T')[0];
    clocking.startTime = now.toISOString();
    clocking.status = 'active';

    return this.clockingService.create(clocking, req.user);
  }

  @Post('clock-out')
  clockOut(@Request() req: AuthenticatedRequest) {
    return this.clockingService.completeActive(req.user);
  }
  @Put(':id')
  updateClocking(
    @Param('id') id: string,
    @Body() clocking: Partial<Clocking>,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.clockingService.update(id, clocking, req.user);
  }
  @Delete(':id')
  deleteClocking(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.clockingService.delete(id, req.user);
  }
}
