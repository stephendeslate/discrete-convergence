// TRACED:EM-AUTH-001
export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  organizationId: string;
}

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
  organizationId: string;
}

export function extractUserFromRequest(req: { user?: AuthenticatedUser }): AuthenticatedUser {
  if (!req.user) {
    throw new Error('User not found in request');
  }
  return req.user;
}
