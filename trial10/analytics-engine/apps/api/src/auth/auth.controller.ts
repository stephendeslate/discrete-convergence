import { Controller, Post, Body, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public, RequestWithUser } from '../common/auth-utils';

// TRACED: AE-AUTH-005
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<{ access_token: string }> {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto): Promise<{ access_token: string }> {
    return this.authService.login(dto);
  }

  @Get('profile')
  async getProfile(@Req() req: RequestWithUser): Promise<{ sub: string; email: string; role: string; tenantId: string }> {
    return {
      sub: req.user.sub,
      email: req.user.email,
      role: req.user.role,
      tenantId: req.user.tenantId,
    };
  }
}
