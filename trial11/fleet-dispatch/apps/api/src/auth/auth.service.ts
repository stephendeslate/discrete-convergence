import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../common/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { BCRYPT_SALT_ROUNDS } from '@fleet-dispatch/shared';
import { UserRole } from '@prisma/client';

// TRACED: FD-AUTH-001
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // TRACED: FD-AUTH-002
  async register(dto: RegisterDto): Promise<{ id: string; email: string }> {
    // findFirst justified: checking for existing email before insert; email is unique but
    // we want a friendly error message instead of a Prisma unique constraint violation
    const existing = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });
    // TRACED: FD-AUTH-005
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

    return { id: user.id, email: user.email };
  }

  // TRACED: FD-AUTH-006
  async login(dto: LoginDto): Promise<{ access_token: string }> {
    // findFirst justified: email lookup for authentication; email is unique but findUnique
    // requires the @unique field directly, and we want consistent error handling
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    // TRACED: FD-AUTH-007
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // TRACED: FD-AUTH-008
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    const access_token = this.jwtService.sign(payload);
    return { access_token };
  }
}
