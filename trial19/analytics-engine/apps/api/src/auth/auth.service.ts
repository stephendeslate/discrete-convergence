import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../infra/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '@prisma/client';

// TRACED: AE-AUTH-001
// TRACED: AE-EDGE-008 — Duplicate email returns 409 Conflict
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // findFirst justified: checking for existing email before registration, email is unique but we handle conflict gracefully
    const existing = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: dto.role as UserRole,
        tenantId: dto.tenantId,
      },
    });

    return this.generateTokens(user.id, user.email, user.role, user.tenantId);
  }

  async login(dto: LoginDto) {
    // findFirst justified: email lookup for login, unique but using findFirst for consistent null handling
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user.id, user.email, user.role, user.tenantId);
  }

  private generateTokens(userId: string, email: string, role: UserRole, tenantId: string) {
    const payload = { sub: userId, email, role, tenantId };

    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET!,
      expiresIn: '7d',
    });

    return { access_token, refresh_token };
  }
}
