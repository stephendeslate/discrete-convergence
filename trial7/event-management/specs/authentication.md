# Authentication Specification

## Overview

The Event Management platform uses JWT-based authentication with bcrypt password
hashing. All endpoints are protected by a global JwtAuthGuard unless explicitly
marked as public via the @Public() decorator.

See also: [security.md](security.md) for RBAC and input validation details.
See also: [api-endpoints.md](api-endpoints.md) for endpoint definitions.

## Registration

Users can self-register with the following constraints:

- VERIFY: EM-AUTH-001 — RegisterDto validates email, password (min 8 chars),
  name, tenantId, and role using class-validator decorators
- VERIFY: EM-AUTH-002 — LoginDto validates email and password with class-validator
- ADMIN role is excluded from self-registration via @IsIn(ALLOWED_REGISTRATION_ROLES)
- Password is hashed using bcrypt with BCRYPT_SALT_ROUNDS (12) from shared package

## Login

- VERIFY: EM-AUTH-003 — AuthService implements register and login with JWT token
  generation, bcrypt hashing, and Prisma user lookup
- Credentials are verified against stored bcrypt hash
- JWT payload includes: sub (userId), email, role, tenantId
- Token expires in 24 hours

## JWT Strategy

- VERIFY: EM-AUTH-005 — JwtStrategy extracts token from Authorization Bearer header,
  validates with JWT_SECRET, and populates request.user

## Auth Controller

- VERIFY: EM-AUTH-004 — AuthController exposes POST /auth/register and POST /auth/login,
  both decorated with @Public() to bypass global JWT guard

## Auth Module

- VERIFY: EM-AUTH-006 — AuthModule registers JwtModule with secret from JWT_SECRET env,
  PassportModule, AuthService, and JwtStrategy

## Token Flow

1. Client sends POST /auth/login with email + password
2. AuthService validates credentials against database
3. On success, JWT token is returned in response body
4. Client includes token in Authorization: Bearer header for subsequent requests
5. JwtAuthGuard validates token on every non-public request
6. JwtStrategy populates req.user with { userId, email, role, tenantId }

## Error Handling

- Invalid credentials return 401 Unauthorized
- Duplicate email registration returns 409 Conflict
- Missing/invalid fields return 400 Bad Request via ValidationPipe
- Expired/invalid tokens return 401 via JwtAuthGuard

## Security Considerations

- JWT_SECRET must be provided via environment variable (no hardcoded fallback)
- Passwords are never stored in plain text
- Token expiry prevents indefinite session persistence
- Rate limiting on auth endpoints (5 requests per minute)
