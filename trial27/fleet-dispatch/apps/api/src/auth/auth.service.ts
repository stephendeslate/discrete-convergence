// TRACED: FD-AUTH-001 — Auth service with bcryptjs and JWT
// TRACED: FD-MON-006 — Logger instance per service with class name context
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { BCRYPT_SALT_ROUNDS } from '@fleet-dispatch/shared';

export interface JwtPayload {
  sub: string;
  email: string;
  tenantId: string;
  role: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // TRACED: FD-EDGE-012 — Check for duplicate email within tenant
    // findFirst: check if email already exists in tenant before registration
    const existingUser = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // TRACED: FD-AUTH-005 — bcryptjs with 12 salt rounds
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    // TRACED: FD-AUTH-006 — Registration creates tenant and user atomically in $transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const slug = dto.organizationName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      // findFirst: check if tenant slug already exists to prevent duplicate
      const existingTenant = await tx.tenant.findFirst({
        where: { slug },
      });

      const finalSlug = existingTenant ? `${slug}-${Date.now()}` : slug;

      const tenant = await tx.tenant.create({
        data: {
          name: dto.organizationName,
          slug: finalSlug,
        },
      });

      const user = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          tenantId: tenant.id,
          role: 'admin',
        },
      });

      return { user, tenant };
    });

    const payload: JwtPayload = {
      sub: result.user.id,
      email: result.user.email,
      tenantId: result.tenant.id,
      role: result.user.role,
    };

    this.logger.log(`User registered: ${result.user.email}`);

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        tenantId: result.tenant.id,
      },
    };
  }

  async login(dto: LoginDto) {
    // TRACED: FD-EDGE-001 — Invalid credentials return 401
    // findFirst: tenant-scoped lookup by email for login
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

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    };

    this.logger.log(`User logged in: ${user.email}`);

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }
}
