import { SetMetadata } from '@nestjs/common';
import { Role } from '@analytics-engine/shared';

export const ROLES_KEY = 'roles';
// TRACED:AE-SEC-002
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
