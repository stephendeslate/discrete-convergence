import { Request } from 'express';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  tenantId: string;
}

export interface RequestWithUser extends Request {
  user: JwtPayload;
}
