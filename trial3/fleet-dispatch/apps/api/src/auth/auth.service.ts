import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../infra/prisma.service';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '@fleet-dispatch/shared';
import type { JwtPayload } from '../common/auth-utils';
import type { RegisterDto } from './dto/register.dto';
import type { LoginDto } from './dto/login.dto';

// TRACED:FD-AUTH-001
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ accessToken: string }> {
    // findFirst: scoped by email + companyId composite uniqueness check before insert
    const existing = await this.prisma.user.findFirst({
      where: { email: dto.email, companyId: dto.companyId },
    });

    if (existing) {
      throw new ConflictException('User with this email already exists in this company');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role,
        companyId: dto.companyId,
      },
    });

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };

    return { accessToken: this.jwtService.sign(payload) };
  }

  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    // findFirst: scoped by email + companyId for multi-tenant login isolation
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email, companyId: dto.companyId },
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
      role: user.role,
      companyId: user.companyId,
    };

    return { accessToken: this.jwtService.sign(payload) };
  }
}
