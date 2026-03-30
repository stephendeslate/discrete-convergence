import { Controller, Post, Body } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshDto } from './auth.dto';
import { Public } from '../common/public.decorator';

/** TRACED:EM-AUTH-002 — Auth endpoints with rate limiting */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ short: { ttl: 1000, limit: 10 } })
  @Post('login')
  async login(@Body() dto: LoginDto): Promise<{ access_token: string; refresh_token: string }> {
    return this.authService.login(dto);
  }

  @Public()
  @Throttle({ short: { ttl: 1000, limit: 10 } })
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<{ access_token: string; refresh_token: string }> {
    return this.authService.register(dto);
  }

  @Public()
  @Post('refresh')
  async refresh(@Body() dto: RefreshDto): Promise<{ access_token: string }> {
    return this.authService.refresh(dto.refreshToken);
  }
}
