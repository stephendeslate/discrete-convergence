# Authentication Specification

## Overview

The Analytics Engine uses JWT-based authentication with access tokens (1h TTL)
and refresh tokens (7d TTL). Passwords are hashed using bcryptjs with 12 salt
rounds. The auth module is built on @nestjs/passport with the jwt strategy.

## Registration Flow

1. Client sends POST /auth/register with email, password, name, role, tenantId
2. Service checks for existing user via findFirst (justification: email uniqueness check)
3. If duplicate, returns 409 Conflict
4. Password is hashed with bcryptjs (BCRYPT_SALT_ROUNDS from @repo/shared)
5. User record created with Prisma
6. Returns user id, email, name, role (no password in response)

VERIFY: AE-AUTH-002 — Registration validates unique email before creating user
VERIFY: AE-AUTH-003 — Auth service uses bcryptjs (not bcrypt) for password hashing

## Login Flow

1. Client sends POST /auth/login with email and password
2. Service looks up user via findFirst (justification: email may not be @unique field)
3. If not found, returns 401 Unauthorized with generic message
4. Compares password with bcrypt.compare
5. Signs JWT with sub, email, tenantId, role
6. Creates refresh token record in database
7. Returns access_token and refresh_token

VERIFY: AE-AUTH-001 — JWT payload contains sub, email, tenantId, role

## Token Refresh Flow

1. Client sends POST /auth/refresh with refresh_token in body
2. Service verifies token with JWT_REFRESH_SECRET
3. Looks up stored token via findFirst (justification: verify token existence)
4. Checks expiration
5. Returns new access_token

## Rate Limiting

Auth endpoints are rate-limited with @Throttle({ short: { ttl: 1000, limit: 10 } })
applied to register, login, and refresh endpoints.

VERIFY: AE-AUTH-004 — @Throttle decorator on all auth endpoints
VERIFY: AE-AUTH-005 — JWT strategy extracts token from Authorization Bearer header

## Security Considerations

- Passwords never returned in API responses
- Generic error messages prevent user enumeration
- Refresh tokens stored in database for revocation capability
- Access tokens are short-lived (1 hour)
- Rate limiting prevents brute force attacks
- All auth endpoints marked @Public() (exempt from JWT guard)

## Token Storage (Frontend)

Server actions store tokens in httpOnly cookies:
- access_token: maxAge 3600, httpOnly, secure in production
- refresh_token: maxAge 7d, httpOnly, secure in production

VERIFY: AE-FE-006 — Server actions use httpOnly cookies for token storage
