// TRACED: EM-SEC-005 — Roles decorator for RBAC on admin-only routes
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
