// TRACED:AE-AUTH-001 — JWT authentication with bcrypt using BCRYPT_SALT_ROUNDS from shared
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';
import { UserRole } from '@prisma/client';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ id: string; email: string; role: string }> {
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: dto.role as UserRole,
        tenantId: dto.tenantId,
      },
    });
    return { id: user.id, email: user.email, role: user.role };
  }

  async login(email: string, password: string): Promise<{ access_token: string; refresh_token: string }> {
    // findFirst: lookup by email which may not be unique across tenants
    const user = await this.prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role, tenantId: user.tenantId };
    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    return { access_token, refresh_token };
  }

  async refresh(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    const payload = this.jwtService.verify(refreshToken);
    const newPayload = { sub: payload.sub, email: payload.email, role: payload.role, tenantId: payload.tenantId };
    const access_token = this.jwtService.sign(newPayload);
    const refresh_token = this.jwtService.sign(newPayload, { expiresIn: '7d' });
    return { access_token, refresh_token };
  }
}
