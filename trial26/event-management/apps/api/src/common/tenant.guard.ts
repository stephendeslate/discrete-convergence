// TRACED:EM-SEC-006 TRACED:EM-DATA-002
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

interface AuthenticatedUser {
  userId: string;
  tenantId: string;
  role: string;
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
