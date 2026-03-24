// TRACED:FD-AUTH-003
import { Controller, Post, Body, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from '../common/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    // Default company for registration — in production, company would be determined by subdomain/invite
    return this.authService.register(dto, 'default-company-id');
  }

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  refresh(@Request() req: { user: { sub: string } }) {
    return this.authService.refresh(req.user.sub);
  }
}
