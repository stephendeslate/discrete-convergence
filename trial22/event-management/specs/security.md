# Security Specification

## Overview

Defense-in-depth security with JWT authentication, RBAC, multi-tenant isolation,
input validation, rate limiting, and HTTP security headers.

## Authentication Guards

### JwtAuthGuard (APP_GUARD)
Global JWT validation on all routes. Routes marked with @Public() bypass the guard.
Extracts userId, email, tenantId, role from JWT payload.

### ThrottlerGuard (APP_GUARD)
Global rate limiting with three named configurations:
- short: 100 requests per second
- medium: 500 requests per 10 seconds
- long: 2000 requests per minute

Login and register endpoints have stricter rate limits via
@Throttle({ short: { ttl: 1000, limit: 10 } }).

### RolesGuard (APP_GUARD)
Role-based access control. Checks @Roles() decorator metadata against JWT role.
Endpoints without @Roles() are accessible to any authenticated user.

## Security Measures

VERIFY: EM-SEC-001 — APP_GUARD JwtAuthGuard registered in AppModule
VERIFY: EM-SEC-002 — APP_GUARD ThrottlerGuard registered in AppModule
VERIFY: EM-SEC-003 — RolesGuard checks role metadata from JWT payload
VERIFY: EM-SEC-004 — main.ts validates required env vars before startup
VERIFY: EM-SEC-005 — Helmet middleware with CSP frame-ancestors 'none'
VERIFY: EM-SEC-006 — CORS configured from CORS_ORIGIN env var
VERIFY: EM-SEC-007 — ValidationPipe with whitelist and forbidNonWhitelisted
VERIFY: EM-SEC-008 — PrismaService.setTenantContext uses $executeRaw for RLS

## Input Validation

ValidationPipe configured globally in main.ts with:
- `whitelist: true` — strips unknown properties
- `forbidNonWhitelisted: true` — rejects requests with unknown properties
- `transform: true` — auto-transforms payloads to DTO instances

All DTOs use class-validator decorators (10+ instances across DTOs).

## Row Level Security

RLS enabled with ENABLE + FORCE on all 14 tables in migration.sql.
Each table has a CREATE POLICY checking current_setting('app.current_tenant_id').
PrismaService.setTenantContext() sets the tenant context per request.

## HTTP Security Headers

- x-powered-by disabled in main.ts
- Helmet CSP with frame-ancestors: 'none'
- CORS restricted to CORS_ORIGIN
- Cache-Control headers on GET list endpoints

## Error Handling

GlobalExceptionFilter (APP_FILTER) sanitizes error responses:
- No stack traces exposed
- Correlation ID included in error response
- Sensitive fields redacted in logs via sanitizeLogContext

## Related Specs

See [authentication.md](authentication.md) for auth flow.
See [monitoring.md](monitoring.md) for error logging.
See [api-endpoints.md](api-endpoints.md) for role-protected endpoints.
