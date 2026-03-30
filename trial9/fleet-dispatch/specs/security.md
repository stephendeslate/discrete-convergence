# Security Specification

## Overview

Fleet Dispatch implements defense-in-depth security with JWT authentication,
role-based access control, rate limiting, input validation, CORS protection,
CSP headers, and row-level security at the database level.

## Rate Limiting

<!-- VERIFY: FD-SEC-001 -->
ThrottlerModule is configured with two named rate limit configs:
- `default`: 100 requests per 60 seconds for general endpoints
- `auth`: 5 requests per 60 seconds for authentication endpoints

The TTL and limit values are imported from `@fleet-dispatch/shared`
constants: `THROTTLE_DEFAULT_TTL`, `THROTTLE_DEFAULT_LIMIT`,
`THROTTLE_AUTH_LIMIT`.

<!-- VERIFY: FD-SEC-002 -->
ThrottlerGuard is registered as a global `APP_GUARD` in AppModule,
applying rate limiting to all endpoints automatically.

## JWT Configuration

<!-- VERIFY: FD-SEC-003 -->
JWT token expiration is configured using `JWT_EXPIRES_IN` from the
shared constants package, set to '1h' by default.

<!-- VERIFY: FD-SEC-004 -->
The JWT secret is loaded from the `JWT_SECRET` environment variable
with no hardcoded fallback. Missing JWT_SECRET causes startup failure
via `validateEnvVars()`.

## Access Control

<!-- VERIFY: FD-SEC-005 -->
The `@Roles()` decorator sets metadata for role-based access control.
At least two endpoints use role restrictions (vehicle delete, auth admin).

<!-- VERIFY: FD-SEC-006 -->
RolesGuard checks the `@Roles()` metadata against the JWT payload's
role field. If no roles are required, access is granted. If roles are
specified, the user's role must match at least one.

<!-- VERIFY: FD-SEC-007 -->
The auth admin endpoint (`GET /auth/admin`) requires ADMIN role,
demonstrating RBAC enforcement on sensitive operations.

## Security Testing

<!-- VERIFY: FD-SEC-008 -->
Security integration tests verify:
- Unauthenticated requests return 401
- Invalid tokens are rejected
- Role-restricted endpoints enforce RBAC
- Input validation rejects malformed data
- Error responses do not leak internal details
- Correlation IDs are present in error responses

## Helmet Configuration

Helmet.js middleware is configured in main.ts with Content Security Policy:
- `default-src: 'self'`
- `script-src: 'self'`
- `style-src: 'self' 'unsafe-inline'`
- `img-src: 'self' data:`
- `frame-ancestors: 'none'`

## CORS Configuration

CORS is enabled with:
- Origin from `CORS_ORIGIN` environment variable (no fallback)
- Credentials: true
- Explicit allowed headers and methods

## Input Validation

ValidationPipe is configured globally with:
- `whitelist: true` — strips unknown properties
- `forbidNonWhitelisted: true` — rejects unknown properties
- `transform: true` — auto-transforms payloads to DTO types

All DTOs use class-validator decorators (>= 10 instances total):
- `@IsString()`, `@IsEmail()`, `@MaxLength()`
- `@IsOptional()`, `@IsIn()`, `@IsNumberString()`
- `@IsUUID()`, `@IsDateString()`, `@IsNumber()`
