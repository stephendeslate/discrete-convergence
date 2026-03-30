// TRACED:EM-SEC-001
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
/** Mark a route with required roles for RBAC enforcement */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
