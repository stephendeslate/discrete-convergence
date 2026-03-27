// TRACED: EM-AUTH-001 — Authentication service with bcryptjs
// TRACED: EM-AUTH-002 — Password hashing with 12 salt rounds

import { Injectable, ConflictException, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { BCRYPT_SALT_ROUNDS, UserRole } from '@event-management/shared';
import { JwtPayload } from '../common/auth-utils';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ accessToken: string }> {
    // TRACED: EM-EDGE-005 — Check for duplicate email within tenant
    // findFirst: tenant-scoped lookup to check existing user by email before registration
    const existingUser = await this.prisma.user.findFirst({
      where: { email: dto.email, tenantId: dto.tenantId },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists in this tenant');
    }

    // TRACED: EM-AUTH-002 — Hash password with bcryptjs
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        tenantId: dto.tenantId,
        // TRACED: EM-SEC-005 — Force MEMBER role on registration to prevent privilege escalation
        role: UserRole.MEMBER,
      },
    });

    // TRACED: EM-AUTH-001 — Generate JWT on registration
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    };

    this.logger.log(`User registered: ${user.email}`);

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    // findFirst: login lookup by email (email is not globally unique, scoped by tenant)
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (!user) {
      // TRACED: EM-EDGE-003 — Invalid credentials (user not found)
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      // TRACED: EM-EDGE-003 — Invalid credentials (wrong password)
      throw new UnauthorizedException('Invalid credentials');
    }

    // TRACED: EM-AUTH-001 — Generate JWT on login
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    };

    this.logger.log(`User logged in: ${user.email}`);

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
