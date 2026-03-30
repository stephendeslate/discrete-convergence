// TRACED:AE-AUTH-001 — auth service with JWT + bcrypt
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../infra/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';
import type { JwtPayload } from '../common/auth-utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string): Promise<{ accessToken: string }> {
    // findFirst: scope by email across all tenants since email is not globally unique
    const user = await this.prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async register(
    email: string,
    password: string,
    tenantName: string,
    role: string,
  ): Promise<{ accessToken: string }> {
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const tenant = await this.prisma.tenant.create({
      data: { name: tenantName },
    });

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        role: role as 'USER' | 'VIEWER',
        tenantId: tenant.id,
      },
    });

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
