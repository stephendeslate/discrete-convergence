// TRACED:EM-AUTH-004 — auth service with bcrypt + JWT, BCRYPT_SALT_ROUNDS from shared
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { BCRYPT_SALT_ROUNDS, ALLOWED_REGISTRATION_ROLES } from '@event-management/shared';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<{ accessToken: string; refreshToken: string }> {
    // findFirst: scoped by email + organizationId for multi-tenant lookup (not unique by email alone)
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async register(dto: RegisterDto): Promise<{ accessToken: string }> {
    if (!ALLOWED_REGISTRATION_ROLES.includes(dto.role as (typeof ALLOWED_REGISTRATION_ROLES)[number])) {
      throw new ConflictException('Invalid registration role');
    }

    // findFirst: check existing email within organization scope (compound unique check)
    const existing = await this.prisma.user.findFirst({
      where: { email: dto.email, organizationId: dto.organizationId },
    });

    if (existing) {
      throw new ConflictException('Email already registered in this organization');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role as 'ORGANIZER' | 'ATTENDEE',
        organizationId: dto.organizationId,
      },
    });

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const newPayload = {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
        organizationId: payload.organizationId,
      };
      return { accessToken: this.jwtService.sign(newPayload) };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
