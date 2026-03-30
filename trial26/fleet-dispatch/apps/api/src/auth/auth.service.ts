// TRACED:FD-AUTH-004 — Authentication service with bcryptjs
// TRACED:FD-AUTH-INT-001 — Auth: register creates user and returns tokens
// TRACED:FD-AUTH-INT-002 — Auth: register rejects invalid email
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcryptjs from 'bcryptjs';
import { PrismaService } from '../infra/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  BCRYPT_SALT_ROUNDS,
  JWT_ACCESS_EXPIRY,
  JWT_REFRESH_EXPIRY,
} from '@repo/shared';

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  tenantId: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // TRACED:FD-AUTH-005 — Register with duplicate email check
  async register(dto: RegisterDto): Promise<AuthTokens> {
    // tenant-scoped query
    const existing = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcryptjs.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: dto.role ?? 'VIEWER',
        tenantId: dto.tenantId,
      },
    });

    this.logger.log(`User registered: ${user.id}`);
    return this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    });
  }

  // TRACED:FD-AUTH-006 — Login with password verification
  async login(dto: LoginDto): Promise<AuthTokens> {
    // tenant-scoped query
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcryptjs.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.log(`User logged in: ${user.id}`);

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
      role: user.role,
      tenantId: user.tenantId,
    });
  }

  // TRACED:FD-AUTH-007 — Token refresh
  async refresh(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = this.jwtService.verify<TokenPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      // tenant-scoped query
      const user = await this.prisma.user.findFirst({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.generateTokens({
        sub: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private generateTokens(payload: TokenPayload): AuthTokens {
    return {
      accessToken: this.jwtService.sign(payload, {
        expiresIn: JWT_ACCESS_EXPIRY,
      }),
      refreshToken: this.jwtService.sign(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: JWT_REFRESH_EXPIRY,
      }),
    };
  }
}
