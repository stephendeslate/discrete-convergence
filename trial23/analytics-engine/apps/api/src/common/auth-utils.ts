// TRACED:AE-AUTH-004 — Tenant extraction helper eliminating repeated req.user cast
import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
    tenantId: string;
    role: string;
  };
}
