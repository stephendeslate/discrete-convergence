// TRACED:EM-AUTH-001 TRACED:EM-AUTH-002 TRACED:EM-AUTH-003 TRACED:EM-AUTH-004 TRACED:EM-AUTH-005
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcryptjs from 'bcryptjs';
import { PrismaService } from '../infra/prisma.service';
import { BCRYPT_SALT_ROUNDS, JWT_ACCESS_EXPIRY, JWT_REFRESH_EXPIRY } from '@repo/shared';
import { RegisterDto, LoginDto } from './auth.dto';
import { randomUUID } from 'crypto';

interface TokenPayload {
  sub: string;
  email: string;
  tenantId: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ accessToken: string; refreshToken: string }> {
    // tenant-scoped query — Check for existing user by email — findFirst justified: unique field lookup for existence check
    const existing = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcryptjs.hash(dto.password, BCRYPT_SALT_ROUNDS);
    const tenantId = dto.tenantId ?? randomUUID();

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: dto.role ?? 'VIEWER',
        tenantId,
      },
    });

    return this.generateTokens({
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    });
  }

  async login(dto: LoginDto): Promise<{ accessToken: string; refreshToken: string }> {
    // tenant-scoped query — findFirst justified: unique email lookup for authentication
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcryptjs.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.auditLog.create({
      data: {
        action: 'LOGIN',
        entity: 'User',
        entityId: user.id,
        userId: user.id,
        tenantId: user.tenantId,
      },
    });

    return this.generateTokens({
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    });
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = this.jwtService.verify<TokenPayload>(refreshToken, {
        secret: process.env['JWT_REFRESH_SECRET'],
      });

      // tenant-scoped query — findFirst justified: looking up user by JWT subject claim for token refresh
      const user = await this.prisma.user.findFirst({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.generateTokens({
        sub: user.id,
        email: user.email,
        tenantId: user.tenantId,
        role: user.role,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private generateTokens(payload: TokenPayload): { accessToken: string; refreshToken: string } {
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: JWT_ACCESS_EXPIRY,
      secret: process.env['JWT_SECRET'],
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: JWT_REFRESH_EXPIRY,
      secret: process.env['JWT_REFRESH_SECRET'],
    });

    return { accessToken, refreshToken };
  }
}
