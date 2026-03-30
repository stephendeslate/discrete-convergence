// TRACED:JWT-STRAT — JWT strategy
// TRACED:AUTH-JWT-STRATEGY — ExtractJwt.fromAuthHeaderAsBearerToken, env secret (VERIFY:AUTH-JWT-STRATEGY)
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface JwtPayload {
  sub: string;
  email: string;
  tenantId: string;
  role: string;
}

/**
 * JWT strategy for Passport authentication.
 * TRACED:AE-AUTH-005 — JWT strategy with env-based secret
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env['JWT_SECRET']!,
    });
  }

  validate(payload: JwtPayload): { userId: string; email: string; tenantId: string; role: string } {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      tenantId: payload.tenantId,
      role: payload.role,
    };
  }
}
