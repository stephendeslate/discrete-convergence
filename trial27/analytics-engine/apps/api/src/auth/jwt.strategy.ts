import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../infra/prisma.service';

interface JwtPayload {
  sub: string;
  email: string;
  tenantId: string;
}

// TRACED: AE-SEC-001 — JWT authentication

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  async validate(
    payload: JwtPayload,
  ): Promise<{ id: string; email: string; tenantId: string }> {
    if (!payload.sub || !payload.tenantId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    await this.prisma.setTenantContext(payload.tenantId);

    return {
      id: payload.sub,
      email: payload.email,
      tenantId: payload.tenantId,
    };
  }
}
