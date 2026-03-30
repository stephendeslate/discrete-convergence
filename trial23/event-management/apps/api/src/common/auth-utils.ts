import { Request } from 'express';

export interface AuthenticatedUser {
  sub: string;
  email: string;
  role: string;
  organizationId: string;
}

export function extractUser(req: Request): AuthenticatedUser {
  return (req as Request & { user: AuthenticatedUser }).user;
}
