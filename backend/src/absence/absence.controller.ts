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
import { AbsenceService } from './absence.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Absence } from './absence.entity';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

@Controller('absences')
@UseGuards(JwtAuthGuard)
export class AbsenceController {
  constructor(private readonly absenceService: AbsenceService) {}

  @Get()
  getAllAbsences(@Request() req: AuthenticatedRequest) {
    return this.absenceService.getAll(req.user);
  }

  @Post()
  createAbsence(
    @Body() absence: Absence,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.absenceService.create(absence, req.user);
  }
  @Put(':id')
  updateAbsence(
    @Param('id') id: string,
    @Body() absence: Partial<Absence>,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.absenceService.update(id, absence, req.user);
  }

  @Delete(':id')
  deleteAbsence(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.absenceService.delete(id, req.user);
  }
}
