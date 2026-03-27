// TRACED: EM-AUTH-001 — Auth controller with public register/login
// TRACED: EM-AUTH-005 — Login rate limiting
// TRACED: EM-API-001 — POST /auth/register creates user and returns JWT
// TRACED: EM-API-002 — POST /auth/login authenticates and returns JWT

import { Controller, Post, Body } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from '../common/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // TRACED: EM-AUTH-003 — Public registration endpoint
  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<{ accessToken: string }> {
    return this.authService.register(dto);
  }

  // TRACED: EM-AUTH-004 — Public login endpoint with rate limiting
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('login')
  async login(@Body() dto: LoginDto): Promise<{ accessToken: string }> {
    return this.authService.login(dto);
  }
}
