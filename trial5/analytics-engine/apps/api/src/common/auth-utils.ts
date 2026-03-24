// TRACED:AE-AUTH-004 — Tenant extraction helper eliminating repeated req.user cast
import type { Request } from 'express';

interface AuthenticatedUser {
  userId: string;
  tenantId: string;
  role: string;
}

export function getTenantId(req: Request): string {
  return (req.user as AuthenticatedUser).tenantId;
}

export function getUserId(req: Request): string {
  return (req.user as AuthenticatedUser).userId;
}
