// TRACED:AUTH-SVC — Auth service with JWT and bcrypt
// TRACED:AUTH-BCRYPT-SALT — bcrypt salt rounds = 12 (VERIFY:AUTH-BCRYPT-SALT)
// TRACED:AUTH-REGISTER-FLOW — register → hash → create → tokens (VERIFY:AUTH-REGISTER-FLOW)
// TRACED:AUTH-LOGIN-FLOW — login → findFirst → bcrypt compare → tokens (VERIFY:AUTH-LOGIN-FLOW)
// TRACED:AUTH-LOGIN-INVALID — throws UnauthorizedException on bad credentials (VERIFY:AUTH-LOGIN-INVALID)
// TRACED:AUTH-REFRESH-FLOW — refresh → verify → lookup → new tokens (VERIFY:AUTH-REFRESH-FLOW)
// TRACED:SEC-BCRYPT — passwords hashed with bcryptjs (VERIFY:SEC-BCRYPT)
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../infra/prisma.service';
import { BCRYPT_SALT_ROUNDS, JWT_ACCESS_EXPIRY, JWT_REFRESH_EXPIRY } from '@repo/shared';

interface TokenPayload {
  sub: string;
  email: string;
  tenantId: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Authentication service handling register, login, and token refresh.
 * TRACED:AE-AUTH-001 — Auth service with bcryptjs salt 12
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly SALT_ROUNDS = BCRYPT_SALT_ROUNDS;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register a new user.
   * TRACED:AE-AUTH-002 — User registration with duplicate check
   */
  async register(
    email: string,
    password: string,
    tenantId?: string,
  ): Promise<AuthTokens> {
    // findFirst justified: checking email uniqueness before insert — unique constraint backup
    const existingUser = await this.prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);
    const resolvedTenantId = tenantId ?? process.env['DEFAULT_TENANT_ID'] ?? 'default-tenant';

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        tenantId: resolvedTenantId,
        role: 'VIEWER',
      },
    });

    return this.generateTokens({
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    });
  }

  /**
   * Login with email and password.
   * TRACED:AE-AUTH-003 — Login with bcrypt compare and branching
   */
  async login(email: string, password: string): Promise<AuthTokens> {
    // findFirst justified: looking up user by unique email for authentication
    const user = await this.prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    this.logger.log(`User ${user.id} logged in successfully`);

    return this.generateTokens({
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    });
  }

  /**
   * Refresh an access token.
   * TRACED:AE-AUTH-004 — Token refresh with verification branching
   */
  async refresh(refreshToken: string): Promise<AuthTokens> {
    let payload: TokenPayload;
    try {
      payload = this.jwtService.verify<TokenPayload>(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // findFirst justified: looking up user by ID from verified JWT payload
    const user = await this.prisma.user.findFirst({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    return this.generateTokens({
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    });
  }

  private generateTokens(payload: TokenPayload): AuthTokens {
    const accessToken = this.jwtService.sign(payload, { expiresIn: JWT_ACCESS_EXPIRY });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: JWT_REFRESH_EXPIRY });
    return { accessToken, refreshToken };
  }
}
