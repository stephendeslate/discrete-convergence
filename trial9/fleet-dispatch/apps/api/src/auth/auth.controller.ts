import { Controller, Post, Body, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public, Roles, RequestWithUser } from '../common/auth-utils';

// TRACED: FD-AUTH-008
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
  getProfile(@Req() req: RequestWithUser): Record<string, unknown> {
    return {
      id: req.user.sub,
      email: req.user.email,
      role: req.user.role,
      tenantId: req.user.tenantId,
    };
  }

  // TRACED: FD-SEC-007
  @Get('admin/users')
  @Roles('ADMIN')
  getAdminUsers(@Req() req: RequestWithUser): Record<string, string> {
    return { tenantId: req.user.tenantId, message: 'Admin access granted' };
  }
}
