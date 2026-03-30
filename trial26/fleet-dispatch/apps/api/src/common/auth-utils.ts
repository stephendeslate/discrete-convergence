// TRACED:FD-COMMON-006 — Auth utility functions
// TRACED:FD-UTIL-001 — extractUserFromRequest returns authenticated user
// TRACED:FD-UTIL-002 — extractUserFromRequest throws when no user
// TRACED:FD-UTIL-003 — requireRole allows permitted roles
// TRACED:FD-UTIL-004 — requireRole rejects unauthorized roles
import { Request } from 'express';
import { UnauthorizedException } from '@nestjs/common';
import { AuthenticatedUser } from './tenant.guard';

export function extractUserFromRequest(request: Request): AuthenticatedUser {
  const user = request.user as AuthenticatedUser | undefined;
  if (!user) {
    throw new UnauthorizedException('User not authenticated');
  }
  return user;
}

export function requireRole(user: AuthenticatedUser, roles: string[]): void {
  if (!roles.includes(user.role)) {
    throw new UnauthorizedException(
      `Role ${user.role} is not authorized for this action`,
    );
  }
}
