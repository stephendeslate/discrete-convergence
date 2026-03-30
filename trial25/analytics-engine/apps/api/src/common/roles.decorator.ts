// TRACED:RBAC-DECORATOR — Roles decorator for RBAC
import { SetMetadata } from '@nestjs/common';

/**
 * Roles decorator for role-based access control.
 * TRACED:AE-RBAC-001 — Roles decorator sets metadata for RolesGuard
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
