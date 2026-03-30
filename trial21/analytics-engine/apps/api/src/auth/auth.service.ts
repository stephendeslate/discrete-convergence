import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../infra/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Role } from '@prisma/client';

/**
 * Authentication service handling login, registration, and token refresh.
 * VERIFY: AE-AUTH-004 — JWT access token expiry ≤1h
 * VERIFY: AE-AUTH-005 — password hashing with bcryptjs
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<{ access_token: string; refresh_token: string }> {
    // findFirst used here: email lookup with potential tenant filtering
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email },
      include: { tenant: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash); // TRACED: AE-AUTH-005
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.log(`User ${user.id} logged in`);
    return this.generateTokens(user.id, user.email, user.role, user.tenantId);
  }

  async register(dto: RegisterDto): Promise<{ access_token: string; refresh_token: string }> {
    // findFirst used here: checking email uniqueness before registration
    const existing = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered'); // TRACED: AE-AUTH-008
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const tenant = await this.prisma.tenant.create({
      data: { name: dto.tenantName },
    });

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: dto.role as Role,
        tenantId: tenant.id,
      },
    });

    this.logger.log(`User ${user.id} registered with tenant ${tenant.id}`);
    return this.generateTokens(user.id, user.email, user.role, user.tenantId);
  }

  async refresh(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const payload = this.jwt.verify(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });

      return this.generateTokens(
        payload.sub as string,
        payload.email as string,
        payload.role as string,
        payload.tenantId as string,
      );
    } catch {
      throw new UnauthorizedException('Invalid refresh token'); // TRACED: AE-AUTH-009
    }
  }

  private generateTokens(
    userId: string,
    email: string,
    role: string,
    tenantId: string,
  ): { access_token: string; refresh_token: string } {
    const payload = { sub: userId, email, role, tenantId };

    const access_token = this.jwt.sign(payload, {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: '1h', // TRACED: AE-AUTH-004
    });

    const refresh_token = this.jwt.sign(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    return { access_token, refresh_token };
  }
}
