import { Controller, Post, Body } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshDto } from './dto/refresh.dto';
import { Public } from './public.decorator';

/**
 * Authentication endpoints for login, registration, and token refresh.
 * TRACED: FD-AUTH-003
 * TRACED: FD-AUTH-008 — rate limiting on login and register endpoints
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ short: { ttl: 1000, limit: 10 } })
  @Post('login')
  async login(
    @Body() dto: LoginDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    return this.authService.login(dto);
  }

  @Public()
  @Throttle({ short: { ttl: 1000, limit: 10 } })
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    return this.authService.register(dto);
  }

  @Public()
  @Post('refresh')
  async refresh(
    @Body() dto: RefreshDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    return this.authService.refresh(dto.refreshToken);
  }
}
