// TRACED:RBAC-GUARD — Roles guard for RBAC
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY } from './roles.decorator';
import { AuthUser } from './auth-utils';

/**
 * Guard that checks user roles against required roles.
 * TRACED:AE-RBAC-002 — RolesGuard checks role metadata
 */
@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as AuthUser | undefined;

    if (!user) {
      this.logger.warn('No user found on request for role check');
      throw new ForbiddenException('Authentication required');
    }

    const hasRole = requiredRoles.some((role) => user.role === role);
    if (!hasRole) {
      this.logger.warn(
        `User ${user.userId} with role ${user.role} denied access (requires: ${requiredRoles.join(', ')})`,
      );
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
