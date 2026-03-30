// TRACED:API-AUTH-CONTROLLER
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshDto } from './dto';
import { Public } from '../common/auth-utils';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // fully-public endpoint
  @Public()
  @Post('register')
  @SkipThrottle()
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // fully-public endpoint
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // fully-public endpoint
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }
}
