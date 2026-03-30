import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../infra/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { BCRYPT_SALT_ROUNDS, ALLOWED_REGISTRATION_ROLES } from '@analytics-engine/shared';
import { UserRole, Prisma } from '@prisma/client';

// TRACED: AE-AUTH-002 — Registration validates role against ALLOWED_REGISTRATION_ROLES from shared package
// TRACED: AE-AUTH-003 — Login returns JWT access_token with user payload containing sub, email, role, tenantId
// TRACED: AE-SEC-002 — AuthService uses bcryptjs with BCRYPT_SALT_ROUNDS from shared for password hashing
// TRACED: AE-SEC-006 — AuthService implements setTenantContext using $executeRaw with Prisma.sql template

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    if (
      !ALLOWED_REGISTRATION_ROLES.includes(
        dto.role as (typeof ALLOWED_REGISTRATION_ROLES)[number],
      )
    ) {
      throw new UnauthorizedException('Role not allowed for registration');
    }

    // findFirst justification: checking if email already exists across all tenants, email is unique but not the PK
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

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };
  }

  async login(dto: LoginDto) {
    // findFirst justification: looking up user by email which is unique but not the primary key
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }

  async setTenantContext(tenantId: string) {
    await this.prisma.$executeRaw(
      Prisma.sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`,
    );
  }
}
