import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/** Restrict endpoint to specific roles — TRACED:EM-SEC-007 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
