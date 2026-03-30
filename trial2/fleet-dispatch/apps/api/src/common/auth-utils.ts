/**
 * Interface for the JWT payload extracted from request.
 */
export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  companyId: string;
}

/**
 * Interface for the authenticated user attached to request.
 */
export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
  companyId: string;
}
