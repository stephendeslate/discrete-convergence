# Authentication Specification

## Overview

JWT-based authentication with bcrypt password hashing. Registration restricted
to approved roles. Global JWT guard applied via APP_GUARD with @Public() exemptions.

## Registration

- VERIFY:AE-DTO-001 — RegisterDto validates email (@IsEmail), name (@IsString, @MaxLength),
  password (@IsString), and role (@IsIn(ALLOWED_REGISTRATION_ROLES))
- VERIFY:AE-AUTH-002 — Auth service hashes passwords using BCRYPT_SALT_ROUNDS from shared
- Only USER and VIEWER roles are allowed for self-registration
- ADMIN role can only be assigned by existing admins (blocked at DTO level)
- Duplicate email returns 409 Conflict

## Login

- VERIFY:AE-AUTH-003 — Auth controller marks login and register as @Public()
- Login accepts email + password, returns JWT access token and refresh token
- Invalid credentials return 401 Unauthorized with generic message (no user enumeration)
- findFirst for user lookup justified: email is unique, single result expected

## JWT Strategy

- VERIFY:AE-AUTH-004 — Passport JWT strategy extracts token from Authorization Bearer header
- Token payload contains userId, email, role, tenantId
- Token expiry configured via JWT_EXPIRES_IN environment variable
- Secret from JWT_SECRET environment variable (no fallback)

## Guard Chain

- VERIFY:AE-GUARD-002 — JwtAuthGuard registered as APP_GUARD, applies to all routes
- VERIFY:AE-AUTH-005 — Guard checks IS_PUBLIC_KEY metadata to skip JWT validation
- VERIFY:AE-AUTH-001 — @Public() decorator sets IS_PUBLIC_KEY metadata via SetMetadata
- Guard order: ThrottlerGuard first, then JwtAuthGuard

## Token Refresh

- Refresh endpoint accepts valid JWT, returns new access token
- Refresh requires authentication (not @Public)
- findFirst for user lookup justified: userId from JWT payload is unique

## Cross-References

- See [security.md](security.md) for rate limiting on auth endpoints (name: 'auth', limit: 5)
- See [api-endpoints.md](api-endpoints.md) for full route listing
- See [monitoring.md](monitoring.md) for auth failure logging via structured format

## Password Security

- VERIFY:AE-CONST-001 — BCRYPT_SALT_ROUNDS=12 defined in shared constants
- Passwords never logged (sanitizeLogContext redacts password fields)
- No password in JWT payload or API responses
- bcrypt compare for timing-safe comparison

## Test Coverage

- VERIFY:AE-TEST-001 — Auth integration tests cover register success, ADMIN rejection,
  missing fields, invalid email, extra field stripping, login failures, refresh without auth
- VERIFY:AE-TEST-007 — Auth service unit tests with mocked Prisma verify
  register, duplicate email, login success/failure, refresh

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| JWT_SECRET | Yes | HMAC signing key for tokens |
| JWT_EXPIRES_IN | Yes | Token expiry duration (e.g., '1h') |
| DATABASE_URL | Yes | PostgreSQL connection string |
