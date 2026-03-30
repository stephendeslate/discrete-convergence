// TRACED:API-AUTH-SERVICE
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../infra/prisma.module';
import { BCRYPT_SALT_ROUNDS } from '@fleet-dispatch/shared';
import { RegisterDto, LoginDto } from './dto';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends TokenPair {
  user: {
    id: string;
    email: string;
    role: string;
    companyId: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.prisma.user.findUnique({
      where: { email_companyId: { email: dto.email, companyId: dto.companyId } },
    });

    if (existing) {
      throw new ConflictException('Email already registered for this company');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: 'VIEWER',
        companyId: dto.companyId,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role, user.companyId);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      },
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const where = dto.companyId
      ? { email_companyId: { email: dto.email, companyId: dto.companyId } }
      : undefined;

    const user = where
      ? await this.prisma.user.findUnique({ where })
      : await this.prisma.user.findFirst({ where: { email: dto.email } }); // email lookup fallback

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role, user.companyId);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      },
    };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    try {
      const payload = this.jwt.verify<{ sub: string; email: string; role: string; companyId: string }>(
        refreshToken,
        { secret: this.config.get<string>('JWT_SECRET') },
      );
      return this.generateTokens(payload.sub, payload.email, payload.role, payload.companyId);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: string,
    companyId: string,
  ): Promise<TokenPair> {
    const payload = { sub: userId, email, role, companyId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        expiresIn: '15m',
      }),
      this.jwt.signAsync(payload, {
        expiresIn: '7d', // refresh token expiry
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
