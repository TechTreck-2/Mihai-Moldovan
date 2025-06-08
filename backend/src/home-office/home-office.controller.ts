import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { HomeOfficeService } from './home-office.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HomeOfficeLocation } from './entities/home-office-location.entity';
import { HomeOfficeRequest } from './entities/home-office-request.entity';

@Controller('home-office')
@UseGuards(JwtAuthGuard)
export class HomeOfficeController {
  constructor(private readonly homeOfficeService: HomeOfficeService) {}

  // Location endpoints
  @Get('locations')
  getAllLocations(@Request() req) {
    return this.homeOfficeService.getAllLocations(req.user);
  }

  @Get('locations/:id')
  getLocationById(@Param('id') id: number, @Request() req) {
    return this.homeOfficeService.getLocationById(id, req.user);
  }

  @Post('locations')
  createLocation(@Body() location: HomeOfficeLocation, @Request() req) {
    return this.homeOfficeService.createLocation(location, req.user);
  }

  @Put('locations/:id')
  updateLocation(@Param('id') id: number, @Body() location: Partial<HomeOfficeLocation>, @Request() req) {
    return this.homeOfficeService.updateLocation(id, location, req.user);
  }

  @Delete('locations/:id')
  deleteLocation(@Param('id') id: number, @Request() req) {
    return this.homeOfficeService.deleteLocation(id, req.user);
  }

  // Request endpoints
  @Get('requests')
  getAllRequests(@Request() req) {
    return this.homeOfficeService.getAllRequests(req.user);
  }

  @Get('requests/:id')
  getRequestById(@Param('id') id: number, @Request() req) {
    return this.homeOfficeService.getRequestById(id, req.user);
  }

  @Post('requests')
  createRequest(@Body() request: HomeOfficeRequest, @Request() req) {
    return this.homeOfficeService.createRequest(request, req.user);
  }

  @Put('requests/:id')
  updateRequest(@Param('id') id: number, @Body() request: Partial<HomeOfficeRequest>, @Request() req) {
    return this.homeOfficeService.updateRequest(id, request, req.user);
  }

  @Delete('requests/:id')
  deleteRequest(@Param('id') id: number, @Request() req) {
    return this.homeOfficeService.deleteRequest(id, req.user);
  }
}