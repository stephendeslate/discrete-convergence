import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { BCRYPT_SALT_ROUNDS, ALLOWED_REGISTRATION_ROLES } from '@event-management/shared';
import { Prisma } from '@prisma/client';

// TRACED: EM-AUTH-006
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    if (!ALLOWED_REGISTRATION_ROLES.includes(dto.role as typeof ALLOWED_REGISTRATION_ROLES[number])) {
      throw new ForbiddenException('Invalid registration role');
    }

    // findFirst used because we check email uniqueness with custom error handling
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
        name: dto.name,
        role: dto.role as 'USER' | 'ORGANIZER',
        tenantId: dto.tenantId,
      },
    });

    return { id: user.id, email: user.email, role: user.role };
  }

  async login(dto: LoginDto) {
    // findFirst used because we need user lookup by email for auth with custom error
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
      tenantId: user.tenantId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  // TRACED: EM-DATA-001
  async getTenantUserCount(tenantId: string): Promise<number> {
    const result = await this.prisma.$executeRaw(
      Prisma.sql`SELECT COUNT(*) FROM "users" WHERE "tenant_id" = ${tenantId}`,
    );
    return result;
  }
}
