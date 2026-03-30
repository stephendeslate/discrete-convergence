import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/services/prisma.service';
import { BCRYPT_SALT_ROUNDS } from '@fleet-dispatch/shared';
import { UserRole } from '@prisma/client';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

// TRACED:FD-AUTH-001 — JWT + bcrypt authentication service
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ accessToken: string }> {
    // findFirst: required because user uniqueness is on (email, companyId) composite, not email alone
    const existing = await this.prisma.user.findFirst({
      where: { email: dto.email, companyId: dto.companyId },
    });

    if (existing) {
      throw new ConflictException('Email already registered for this company');
    }

    // TRACED:FD-AUTH-002 — bcrypt password hashing with shared BCRYPT_SALT_ROUNDS
    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role as UserRole,
        companyId: dto.companyId,
      },
    });

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };

    return { accessToken: this.jwtService.sign(payload) };
  }

  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    // findFirst: required because user lookup is by email + companyId composite, not a unique field
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

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };

    return { accessToken: this.jwtService.sign(payload) };
  }
}
