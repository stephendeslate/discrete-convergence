// TRACED: EM-AUTH-001 — Auth utility types
export interface JwtPayload {
  sub: string;
  email: string;
  tenantId: string;
  role: string;
}

export interface AuthenticatedUser {
  userId: string;
  email: string;
  tenantId: string;
  role: string;
}
