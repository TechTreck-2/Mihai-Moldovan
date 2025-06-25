import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HomeOfficeLocation } from './entities/home-office-location.entity';
import { HomeOfficeRequest } from './entities/home-office-request.entity';
import { User } from '../users/user.entity';

@Injectable()
export class HomeOfficeService {
  constructor(
    @InjectRepository(HomeOfficeLocation)
    private locationRepository: Repository<HomeOfficeLocation>,
    @InjectRepository(HomeOfficeRequest)
    private requestRepository: Repository<HomeOfficeRequest>,
  ) {}

  async getAllLocations(user: User): Promise<HomeOfficeLocation[]> {
    return this.locationRepository.find({ where: { user: { id: user.id } } });
  }
  async getLocationById(id: string, user: User): Promise<HomeOfficeLocation> {
    const location = await this.locationRepository.findOne({ where: { id, user: { id: user.id } } });
    if (!location) {
      throw new Error(`Location with ID ${id} not found.`);
    }
    return location;
  }

  async createLocation(location: Partial<HomeOfficeLocation>, user: User): Promise<HomeOfficeLocation> {
    const newLocation = this.locationRepository.create({
      ...location,
      user
    });
    return this.locationRepository.save(newLocation);
  }

  async updateLocation(id: string, location: Partial<HomeOfficeLocation>, user: User): Promise<HomeOfficeLocation> {
    await this.locationRepository.update(
      { id, user: { id: user.id } },
      location
    );
    return this.getLocationById(id, user);
  }

  async deleteLocation(id: string, user: User): Promise<void> {
    await this.locationRepository.delete({ id, user: { id: user.id } });
  }

  // Request methods
  async getAllRequests(user: User): Promise<HomeOfficeRequest[]> {
    return this.requestRepository.find({ where: { user: { id: user.id } } });
  }
  async getRequestById(id: string, user: User): Promise<HomeOfficeRequest> {
    const request = await this.requestRepository.findOne({ where: { id, user: { id: user.id } } });
    if (!request) {
      throw new Error(`Request with ID ${id} not found.`);
    }
    return request;
  }

  async createRequest(request: Partial<HomeOfficeRequest>, user: User): Promise<HomeOfficeRequest> {
    const newRequest = this.requestRepository.create({
      ...request,
      user
    });
    return this.requestRepository.save(newRequest);
  }

  async updateRequest(id: string, request: Partial<HomeOfficeRequest>, user: User): Promise<HomeOfficeRequest> {
    await this.requestRepository.update(
      { id, user: { id: user.id } },
      request
    );
    return this.getRequestById(id, user); // :)
  }

  async deleteRequest(id: string, user: User): Promise<void> {
    await this.requestRepository.delete({ id, user: { id: user.id } });
  }
}