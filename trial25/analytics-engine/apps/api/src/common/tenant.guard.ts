// TRACED:TENANT-GUARD — Tenant guard
// TRACED:SEC-TENANT-GUARD — enforces tenantId on every authenticated request (VERIFY:SEC-TENANT-GUARD)
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';

interface AuthenticatedUser {
  userId: string;
  tenantId: string;
  email: string;
  role: string;
}

/**
 * Guard that ensures requests include valid tenant context.
 * TRACED:AE-GUARD-001 — Tenant isolation guard
 */
@Injectable()
export class TenantGuard implements CanActivate {
  private readonly logger = new Logger(TenantGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as AuthenticatedUser | undefined;

    if (!user) {
      this.logger.warn('No user found on request');
      throw new ForbiddenException('Authentication required');
    }

    if (!user.tenantId) {
      this.logger.warn(`User ${user.userId} has no tenantId`);
      throw new ForbiddenException('Tenant context required');
    }

    return true;
  }
}
