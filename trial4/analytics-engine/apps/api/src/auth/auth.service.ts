import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
// TRACED:AE-SEC-001 — auth uses BCRYPT_SALT_ROUNDS from shared for password hashing
import { BCRYPT_SALT_ROUNDS } from '@analytics-engine/shared';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    // findFirst: unique lookup by email which is unique in schema
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
    return { accessToken: this.jwtService.sign(payload) };
  }

  async register(
    dto: RegisterDto,
  ): Promise<{ id: string; email: string; role: string }> {
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: dto.role === 'VIEWER' ? 'VIEWER' : 'USER',
        tenantId: dto.tenantId,
      },
    });
    return { id: user.id, email: user.email, role: user.role };
  }

  async validateUser(userId: string): Promise<{ id: string; email: string; role: string; tenantId: string } | null> {
    // findFirst: lookup by ID with tenant context for RLS enforcement
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
    });
    if (!user) return null;
    return { id: user.id, email: user.email, role: user.role, tenantId: user.tenantId };
  }
}
