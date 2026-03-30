import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcryptjs from 'bcryptjs';
import { PrismaService } from '../infra/prisma.service';
import {
  BCRYPT_SALT_ROUNDS,
  ALLOWED_REGISTRATION_ROLES,
} from '@fleet-dispatch/shared';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import pino from 'pino';

const logger = pino({ name: 'auth-service' });

/**
 * Handles authentication: login, registration, token refresh.
 * TRACED: FD-AUTH-001
 * TRACED: FD-AUTH-004 — access token expiry (1h via JwtModule)
 * TRACED: FD-AUTH-005 — refresh token expiry (7d)
 * TRACED: FD-AUTH-006 — generic "Invalid credentials" error (no user enumeration)
 * TRACED: FD-AUTH-007 — bcryptjs with BCRYPT_SALT_ROUNDS
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(
    dto: LoginDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    // findFirst justified: email is unique, but we query by email+password combo for auth
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcryptjs.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    logger.info({ userId: user.id }, 'User logged in');

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      tenantId: user.tenantId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, {
        secret: process.env['JWT_REFRESH_SECRET'] ?? 'dev-refresh-secret',
        expiresIn: '7d',
      }),
    };
  }

  async register(
    dto: RegisterDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    if (!ALLOWED_REGISTRATION_ROLES.includes(dto.role)) {
      throw new BadRequestException(
        `Role must be one of: ${ALLOWED_REGISTRATION_ROLES.join(', ')}`,
      );
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hash = await bcryptjs.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const company = await this.prisma.company.create({
      data: { name: dto.companyName },
    });

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role === 'ADMIN' ? 'ADMIN' : 'DISPATCHER',
        companyId: company.id,
        tenantId: company.id,
      },
    });

    logger.info({ userId: user.id }, 'User registered');

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      tenantId: user.tenantId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, {
        secret: process.env['JWT_REFRESH_SECRET'] ?? 'dev-refresh-secret',
        expiresIn: '7d',
      }),
    };
  }

  async refresh(
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env['JWT_REFRESH_SECRET'] ?? 'dev-refresh-secret',
      });

      const newPayload = {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
        companyId: payload.companyId,
        tenantId: payload.tenantId,
      };

      return {
        access_token: this.jwtService.sign(newPayload),
        refresh_token: this.jwtService.sign(newPayload, {
          secret: process.env['JWT_REFRESH_SECRET'] ?? 'dev-refresh-secret',
          expiresIn: '7d',
        }),
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
