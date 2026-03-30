// TRACED:EM-AUTH-004 — Request user extraction helpers for tenant-scoped controllers
import { Request } from 'express';

interface AuthenticatedUser {
  id: string;
  organizationId: string;
}

export function getOrganizationId(req: Request): string {
  return (req.user as AuthenticatedUser).organizationId;
}

export function getAuthenticatedUser(req: Request): AuthenticatedUser {
  return req.user as AuthenticatedUser;
}
