# Authentication Specification

## Overview

The authentication system provides JWT-based authentication with access and refresh tokens,
password hashing via bcryptjs, and rate limiting on login/register endpoints.

## Authentication Flow

1. User registers with email, password, name, and optional role
2. Password is hashed using bcryptjs with BCRYPT_SALT_ROUNDS from shared
3. JWT access token (1h) and refresh token (7d) are issued on login
4. All protected endpoints require Bearer token in Authorization header
5. JwtAuthGuard validates tokens globally via APP_GUARD

## Endpoints

### POST /auth/register
- Public endpoint (bypasses JWT guard via @Public decorator)
- Rate limited: @Throttle({ short: { ttl: 1000, limit: 10 } })
- Validates: email format, password presence, name maxLength, role allowed values
- Checks for duplicate email+tenant combo before creating
- Returns: user object without password

### POST /auth/login
- Public endpoint with rate limiting
- Validates credentials against stored bcrypt hash
- Returns: { access_token, refresh_token }

### GET /auth/profile
- Protected endpoint (requires valid JWT)
- Returns current user info

## Security Requirements

VERIFY: EM-AUTH-001 — JwtAuthGuard applied globally via APP_GUARD, skippable with @Public()
VERIFY: EM-AUTH-002 — RegisterDto validates role against ALLOWED_REGISTRATION_ROLES from shared
VERIFY: EM-AUTH-003 — JwtStrategy extracts token from Authorization Bearer header
VERIFY: EM-AUTH-004 — AuthService hashes passwords with bcryptjs and BCRYPT_SALT_ROUNDS
VERIFY: EM-AUTH-005 — AuthController rate-limits login/register with @Throttle

## Token Structure

JWT payload contains: sub (userId), email, tenantId, role.
Access tokens expire in 1 hour. Refresh tokens use JWT_REFRESH_SECRET.

## Multi-tenancy

Registration creates or uses a default tenant if no tenantId provided.
Login looks up user by email across tenants (findFirst with justification comment).

## Related Specs

See [security.md](security.md) for RBAC and guard configuration.
See [api-endpoints.md](api-endpoints.md) for full endpoint listing.

## Error Handling

- 400: Invalid input (class-validator rejection)
- 401: Invalid credentials or expired token
- 409: Duplicate email registration
