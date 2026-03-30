import { Request } from 'express';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  organizationId: string;
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}
