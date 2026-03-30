# Authentication Specification

## Overview

Fleet Dispatch uses JWT-based authentication with bcryptjs for password hashing.
Access tokens expire after 1 hour; refresh tokens after 7 days.

## Registration Flow

1. User submits email, password, name, role, and tenantId
2. Server checks for existing email via findFirst
3. Password is hashed using bcryptjs with BCRYPT_SALT_ROUNDS from shared
4. User record is created in PostgreSQL via Prisma
5. Response includes user id, email, name, and role (no password)

<!-- VERIFY: FD-AUTH-001 — RegisterDto validates email format, password length (min 8), and name -->
<!-- VERIFY: FD-AUTH-002 — LoginDto validates email and password are present -->
<!-- VERIFY: FD-AUTH-003 — AuthService hashes password before storage using BCRYPT_SALT_ROUNDS -->

## Login Flow

1. User submits email and password
2. Server looks up user by email using findFirst
3. bcrypt.compare verifies password against stored hash
4. JWT payload includes sub (userId), email, role, and tenantId
5. Returns access_token (1h) and refresh_token (7d)

<!-- VERIFY: FD-AUTH-004 — Login endpoint returns both access_token and refresh_token -->
<!-- VERIFY: FD-AUTH-005 — Invalid credentials return 401 UnauthorizedException -->

## JWT Strategy

- PassportStrategy extracts JWT from Authorization Bearer header
- Validates token signature using JWT_SECRET env var
- Populates request.user with { sub, email, role, tenantId }

<!-- VERIFY: FD-AUTH-006 — JwtStrategy uses process.env.JWT_SECRET -->

## Rate Limiting

- Auth endpoints use @Throttle({ short: { ttl: 1000, limit: 10 } })
- Prevents brute-force attacks on login and register
- @Public() decorator allows unauthenticated access

## Security Considerations

- Passwords are never returned in API responses
- Password hashing uses configurable salt rounds
- JWT expiry limits token exposure window
- Refresh tokens enable session continuation without re-authentication
