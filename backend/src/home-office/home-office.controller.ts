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
import { HomeOfficeService } from './home-office.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HomeOfficeLocation } from './entities/home-office-location.entity';
import { HomeOfficeRequest } from './entities/home-office-request.entity';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

@Controller('home-office')
@UseGuards(JwtAuthGuard)
export class HomeOfficeController {
  constructor(private readonly homeOfficeService: HomeOfficeService) {}

  // Location endpoints
  @Get('locations')
  getAllLocations(@Request() req: AuthenticatedRequest) {
    return this.homeOfficeService.getAllLocations(req.user);
  }
  @Get('locations/:id')
  getLocationById(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.homeOfficeService.getLocationById(id, req.user);
  }

  @Post('locations')
  createLocation(
    @Body() location: HomeOfficeLocation,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.homeOfficeService.createLocation(location, req.user);
  }

  @Put('locations/:id')
  updateLocation(
    @Param('id') id: string,
    @Body() location: Partial<HomeOfficeLocation>,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.homeOfficeService.updateLocation(id, location, req.user);
  }

  @Delete('locations/:id')
  deleteLocation(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.homeOfficeService.deleteLocation(id, req.user);
  }

  // Request endpoints
  @Get('requests')
  getAllRequests(@Request() req: AuthenticatedRequest) {
    return this.homeOfficeService.getAllRequests(req.user);
  }
  @Get('requests/:id')
  getRequestById(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.homeOfficeService.getRequestById(id, req.user);
  }

  @Post('requests')
  createRequest(
    @Body() request: HomeOfficeRequest,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.homeOfficeService.createRequest(request, req.user);
  }
  @Put('requests/:id')
  updateRequest(
    @Param('id') id: string,
    @Body() request: Partial<HomeOfficeRequest>,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.homeOfficeService.updateRequest(id, request, req.user);
  }

  @Delete('requests/:id')
  deleteRequest(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.homeOfficeService.deleteRequest(id, req.user);
  }
}
