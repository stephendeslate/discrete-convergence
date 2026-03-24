// TRACED:FD-AUTH-005 — auth service with bcrypt hashing and JWT token generation
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '@fleet-dispatch/shared';
import { PrismaService } from '../common/services/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string): Promise<{ accessToken: string }> {
    // findFirst: scope by email for multi-tenant login (email is not globally unique)
    const user = await this.prisma.user.findFirst({
      where: { email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };
    return { accessToken: this.jwt.sign(payload) };
  }

  async register(
    email: string,
    password: string,
    name: string,
    role: string,
    tenantId: string,
  ): Promise<{ accessToken: string }> {
    // findFirst: check for existing user scoped by email + tenantId
    const existing = await this.prisma.user.findFirst({
      where: { email, tenantId },
    });
    if (existing) {
      throw new ConflictException('User already exists');
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    const user = await this.prisma.user.create({
      data: { email, passwordHash, name, role: role as 'DISPATCHER' | 'DRIVER', tenantId },
    });

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };
    return { accessToken: this.jwt.sign(payload) };
  }
}
