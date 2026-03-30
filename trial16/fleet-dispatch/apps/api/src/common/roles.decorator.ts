import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
// TRACED: FD-SEC-002
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
