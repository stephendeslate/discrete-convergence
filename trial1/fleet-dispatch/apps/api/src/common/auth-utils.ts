// TRACED:FD-AUTH-010 — Shared helper to extract companyId from authenticated request
import { Request } from 'express';

interface AuthenticatedUser {
  companyId: string;
}

/** Extract the tenant companyId from a JWT-authenticated request. */
export function getCompanyId(req: Request): string {
  return (req.user as AuthenticatedUser).companyId;
}
