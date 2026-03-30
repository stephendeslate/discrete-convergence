import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { validateEnvVars } from '@analytics-engine/shared';

// TRACED: AE-AUTH-004
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    validateEnvVars(['JWT_SECRET']);
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  validate(payload: { sub: string; email: string; role: string; tenantId: string }) {
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId,
    };
  }
}
