import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  tenantId: string;
}

/**
 * JWT strategy for Passport authentication.
 * VERIFY: AE-AUTH-006 — JWT strategy extracts bearer token from Authorization header
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    const secret = config.getOrThrow<string>('JWT_SECRET');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // TRACED: AE-AUTH-006
      ignoreExpiration: false, // TRACED: AE-AUTH-012
      secretOrKey: secret,
    });
  }

  validate(payload: JwtPayload): { userId: string; email: string; role: string; tenantId: string } {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId,
    };
  }
}
