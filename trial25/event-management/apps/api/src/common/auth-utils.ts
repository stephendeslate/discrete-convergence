// TRACED:EM-AUTH-006
import { Request } from 'express';

interface AuthenticatedUser {
  userId: string;
  tenantId: string;
  role: string;
  email: string;
}

/** Extract authenticated user from request safely */
export function getAuthUser(request: Request): AuthenticatedUser {
  const user = request.user as AuthenticatedUser | undefined;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return user;
}
