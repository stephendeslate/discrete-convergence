import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../infra/prisma.service';
import { LoggerService } from '../infra/logger.service';
import { BCRYPT_SALT_ROUNDS } from '@fleet-dispatch/shared';
import { LoginDto, RegisterDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly logger: LoggerService,
  ) {}

  async login(dto: LoginDto): Promise<{ access_token: string }> {
    // findFirst: login lookup by unique email field
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

    this.logger.log(`User ${user.email} logged in`, 'AuthService');

    return { access_token: this.jwtService.sign(payload) };
  }

  async register(dto: RegisterDto): Promise<{ access_token: string }> {
    // findFirst: check for existing user with same email before registration
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
        role: dto.role as 'USER' | 'DISPATCHER',
        tenantId: dto.tenantId,
      },
    });

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    this.logger.log(`User ${user.email} registered`, 'AuthService');

    return { access_token: this.jwtService.sign(payload) };
  }
}
