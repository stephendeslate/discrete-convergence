// TRACED:FD-COMMON-005 — Tenant guard ensures tenant context is set
// TRACED:FD-GUARD-001 — TenantGuard allows valid tenant context
// TRACED:FD-GUARD-002 — TenantGuard rejects missing tenant
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
  tenantId: string;
}

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as AuthenticatedUser | undefined;

    if (!user?.tenantId) {
      throw new ForbiddenException('Tenant context is required');
    }

    return true;
  }
}
