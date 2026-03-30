// TRACED:AE-AUTH-002 — JWT payload and request user types
export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  tenantId: string;
}

export interface RequestUser {
  userId: string;
  email: string;
  role: string;
  tenantId: string;
}
