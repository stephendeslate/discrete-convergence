// TRACED: EM-AUTH-001 — JWT login with bcryptjs + BCRYPT_SALT_ROUNDS
// TRACED: EM-DATA-005 — User email unique constraint
// TRACED: EM-EDGE-001 — Duplicate email → 409 Conflict
// TRACED: EM-EDGE-007 — Forbidden ADMIN role → 403
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../infra/prisma.service';
import { BCRYPT_SALT_ROUNDS, ALLOWED_REGISTRATION_ROLES } from '@repo/shared';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<{ access_token: string; refresh_token: string }> {
    // findFirst used: email is unique but not the primary key
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
      organizationId: user.organizationId,
      role: user.role,
    };
    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    return { access_token, refresh_token };
  }

  async register(dto: RegisterDto): Promise<{ id: string; email: string; name: string; role: string }> {
    if (!ALLOWED_REGISTRATION_ROLES.includes(dto.role)) {
      throw new ForbiddenException('Role not allowed for registration');
    }

    // findFirst used: check for existing user by email before creating
    const existing = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    // findFirst used: retrieve default organization for new user assignment
    let organization = await this.prisma.organization.findFirst({
      where: { name: 'Default' },
    });

    if (!organization) {
      organization = await this.prisma.organization.create({
        data: { name: 'Default' },
      });
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name,
        role: dto.role,
        organizationId: organization.id,
      },
    });

    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }

  async refreshToken(dto: RefreshTokenDto): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const payload = this.jwtService.verify<{
        sub: string;
        email: string;
        organizationId: string;
        role: string;
      }>(dto.refresh_token);

      const newPayload = {
        sub: payload.sub,
        email: payload.email,
        organizationId: payload.organizationId,
        role: payload.role,
      };
      const access_token = this.jwtService.sign(newPayload);
      const refresh_token = this.jwtService.sign(newPayload, { expiresIn: '7d' });

      return { access_token, refresh_token };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
