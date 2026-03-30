// TRACED:FD-AUTH-006 — Tenant extraction helper eliminating repeated req.user cast
import { Request } from 'express';

interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
  tenantId: string;
}

export function getTenantId(req: Request): string {
  return (req.user as AuthenticatedUser).tenantId;
}
