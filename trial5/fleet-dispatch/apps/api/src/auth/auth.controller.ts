// TRACED:FD-AUTH-006 — auth controller with public login/register endpoints
import { Controller, Post, Body } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto): Promise<{ accessToken: string }> {
    return this.authService.login(dto.email, dto.password);
  }

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<{ accessToken: string }> {
    return this.authService.register(
      dto.email,
      dto.password,
      dto.name,
      dto.role,
      dto.tenantId,
    );
  }
}
