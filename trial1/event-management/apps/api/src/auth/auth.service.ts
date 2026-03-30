// TRACED:EM-AUTH-001 — JWT access + refresh token strategy with bcrypt password hashing
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@event-management/shared';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const organization = await this.prisma.organization.create({
      data: { name: `${dto.name}'s Organization` },
    });

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash: hashedPassword,
        role: dto.role as UserRole,
        organizationId: organization.id,
      },
    });

    return { id: user.id, email: user.email, role: user.role };
  }

  async login(email: string, password: string) {
    // findFirst: required for login — email lookup may match multiple tenants in edge cases
    const user = await this.prisma.user.findFirst({ where: { email } }); // email may span tenants
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role, organizationId: user.organizationId };
    return {
      accessToken: this.jwt.sign(payload),
      refreshToken: this.jwt.sign(payload, {
        secret: process.env['JWT_REFRESH_SECRET'],
        expiresIn: '7d',
      }),
    };
  }

  async refresh(refreshToken: string) {
    const payload = this.jwt.verify(refreshToken, { secret: process.env['JWT_REFRESH_SECRET'] });
    const newPayload = { sub: payload.sub, email: payload.email, role: payload.role, organizationId: payload.organizationId };
    return {
      accessToken: this.jwt.sign(newPayload),
      refreshToken: this.jwt.sign(newPayload, {
        secret: process.env['JWT_REFRESH_SECRET'],
        expiresIn: '7d',
      }),
    };
  }
}
