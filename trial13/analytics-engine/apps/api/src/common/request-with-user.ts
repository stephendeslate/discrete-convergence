import { Request } from 'express';

export interface RequestUser {
  sub: string;
  email: string;
  role: string;
  tenantId: string;
}

export interface RequestWithUser extends Request {
  user: RequestUser;
}
