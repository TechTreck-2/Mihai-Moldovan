import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from 'src/services/users.service';
import { AuthenticatedRequest } from './interfaces/authenticated-request.interface';
import { User } from '../users/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const user: User | null = await this.authService.validateUser(
      body.username,
      body.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() body: { username: string; password: string }) {
    const { username, password } = body;

    const existingUser = await this.usersService.findOne(username);
    if (existingUser) {
      throw new BadRequestException('Username already exists');
    }

    const newUser = await this.usersService.create(username, password);
    return { message: 'User registered successfully', userId: newUser.id };
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile')
  getProfile(@Request() req: AuthenticatedRequest): User {
    return req.user;
  }
}
