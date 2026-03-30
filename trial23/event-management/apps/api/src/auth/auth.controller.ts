// TRACED: EM-AUTH-002 — Registration role restriction (ADMIN excluded)
// TRACED: EM-AUTH-003 — Refresh token validation and reissuance
// TRACED: EM-AUTH-005 — Login rate limiting via @Throttle
import { Controller, Post, Body } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from '../common/public.decorator';

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
  async register(@Body() dto: RegisterDto): Promise<{ id: string; email: string; name: string; role: string }> {
    return this.authService.register(dto);
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto): Promise<{ access_token: string; refresh_token: string }> {
    return this.authService.refreshToken(dto);
  }
}
