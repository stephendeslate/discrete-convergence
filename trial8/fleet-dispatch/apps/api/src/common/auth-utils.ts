import { Request } from 'express';

export interface AuthUser {
  sub: string;
  email: string;
  role: string;
  tenantId: string;
}

export function extractTenantId(req: Request): string {
  const user = (req as Request & { user: AuthUser }).user;
  return user.tenantId;
}
