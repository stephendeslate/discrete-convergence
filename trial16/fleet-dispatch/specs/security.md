# Security Specification

## Overview

Fleet Dispatch implements defense-in-depth security through JWT authentication,
role-based access control (RBAC), tenant isolation, rate limiting, and log
sanitization. Security is enforced at both the application and database layers.

## Public Route Decorator

<!-- VERIFY: FD-SEC-001 -->
The `@Public()` decorator sets metadata key `IS_PUBLIC_KEY` on route handlers.
The `JwtAuthGuard` checks for this metadata and skips JWT validation on public
routes. Only auth endpoints (login, register) and monitoring endpoints (health,
readiness, metrics) are marked as public. All other endpoints require a valid JWT.

## Roles Decorator

<!-- VERIFY: FD-SEC-002 -->
The `@Roles()` decorator sets metadata key `ROLES_KEY` with an array of allowed
`UserRole` values. It is used on controller methods to restrict access to specific
roles. For example, DELETE endpoints require `UserRole.ADMIN`, while POST/PATCH
endpoints allow both `UserRole.ADMIN` and `UserRole.DISPATCHER`.

## Roles Guard

<!-- VERIFY: FD-SEC-003 -->
The `RolesGuard` implements `CanActivate` and is registered as a global guard
via `APP_GUARD`. It reads the `ROLES_KEY` metadata from the handler. If no roles
are specified, access is granted (authenticated users only). If roles are specified,
the guard checks that the user's role (from JWT payload) is included in the
allowed roles array. Unauthorized users receive a 403 Forbidden response.

## JWT Strategy — No Hardcoded Secret

<!-- VERIFY: FD-SEC-004 -->
The `JwtStrategy` extends `PassportStrategy(Strategy)` and configures the JWT
secret from `process.env.JWT_SECRET!` with no fallback value. This ensures:
- The application fails fast if JWT_SECRET is not configured
- No hardcoded secrets exist in the codebase
- The `!` non-null assertion is acceptable because `validateEnvVars()` runs
  before the strategy is instantiated

The strategy validates the JWT payload and returns a user object with userId,
email, role, and tenantId.

## Log Sanitization

<!-- VERIFY: FD-SEC-005 -->
The `sanitizeLogContext()` function in the shared package recursively processes
log context objects to redact sensitive fields. It:
- Matches field names case-insensitively (password, PASSWORD, Password all match)
- Redacts values for keys matching: password, secret, token, authorization,
  cookie, api_key, apikey, access_token, refresh_token
- Replaces matched values with `[REDACTED]`
- Recursively processes nested objects and arrays
- Returns a new object (does not mutate the original)

This function is used by the `GlobalExceptionFilter` and request logging
middleware to prevent sensitive data from appearing in application logs.

## Tenant Isolation

Every domain service filters queries by `tenantId` extracted from the JWT payload.
This provides application-level tenant isolation that complements the database-level
Row Level Security policies. The combination ensures that:
1. Application code cannot accidentally query across tenants
2. Even if application logic is bypassed, RLS prevents cross-tenant data access
3. All new records are created with the authenticated user's tenantId

## Rate Limiting

The `ThrottlerModule` is configured with two named rate limit tiers:
- **short**: 10 requests per 1 second (burst protection)
- **long**: 100 requests per 60 seconds (sustained load protection)

The `ThrottlerGuard` is registered globally via `APP_GUARD`. Monitoring endpoints
use `@SkipThrottle()` to exempt health checks from rate limiting.

## Cross-References

- Authentication flow and token lifecycle: see [authentication.md](authentication.md)
- Guard registration order in app.module: see [cross-layer.md](cross-layer.md) (FD-CROSS-001)
- Environment validation ensuring JWT_SECRET exists: see [infrastructure.md](infrastructure.md) (FD-INFRA-002)
- Request logging with sanitized context: see [monitoring.md](monitoring.md) (FD-MON-006)

## Input Validation

All incoming request bodies are validated through the global `ValidationPipe`:
- `whitelist: true` strips properties not defined in the DTO
- `forbidNonWhitelisted: true` rejects requests with unknown properties
- `transform: true` converts plain objects to DTO class instances
- DTOs use `@MaxLength()` on all string fields to prevent oversized inputs
- UUID fields use `@MaxLength(36)` for length validation
