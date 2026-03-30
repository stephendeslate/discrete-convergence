// TRACED:AUTH-UTILS — Auth utility functions
import { Request } from 'express';

/**
 * Authenticated user payload attached to requests.
 * TRACED:AE-AUTH-UTIL-001 — Auth user type
 */
export interface AuthUser {
  userId: string;
  tenantId: string;
  email: string;
  role: string;
}

/**
 * Extracts the authenticated user from a request.
 * TRACED:AE-AUTH-UTIL-002 — Extract auth user
 */
export function extractAuthUser(request: Request): AuthUser {
  const user = request.user as AuthUser | undefined;
  if (!user) {
    throw new Error('No authenticated user on request');
  }
  return user;
}

/**
 * Checks if a user has admin role.
 */
export function isAdmin(user: AuthUser): boolean {
  return user.role === 'ADMIN';
}

/**
 * Checks if a user has at least editor permissions.
 */
export function canEdit(user: AuthUser): boolean {
  return user.role === 'ADMIN' || user.role === 'EDITOR';
}
