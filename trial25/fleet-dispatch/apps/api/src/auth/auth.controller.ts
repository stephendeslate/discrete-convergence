// TRACED:FD-AUTH-009 — Auth controller with rate limiting
// TRACED:FD-CTRL-001 — AuthController register returns tokens
// TRACED:FD-CTRL-002 — AuthController login returns tokens
import { Controller, Post, Body } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { Public } from '../common/public.decorator';

// fully-public: auth endpoints (login/register/refresh) do not require tenant scoping
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // TRACED:FD-AUTH-010 — Login with strict rate limiting
  @Public()
  @Post('login')
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  async refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }
}
