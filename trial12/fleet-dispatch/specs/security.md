# Security Specification

## Overview

Fleet Dispatch implements defense-in-depth security with global authentication,
role-based access control, input validation, rate limiting, CORS, helmet
middleware, and row-level security in the database.

## Requirements

### Global Guards (APP_GUARD Pattern)

- VERIFY: FD-SEC-001
  AppModule registers three global guards via APP_GUARD:
  ThrottlerGuard (rate limiting), JwtAuthGuard (authentication),
  RolesGuard (authorization). Order matters for correct execution.

- VERIFY: FD-SEC-002
  JwtAuthGuard checks for @Public() decorator via Reflector.
  Public endpoints (auth, monitoring) bypass authentication.
  All other endpoints require valid JWT Bearer token.

### Role-Based Access Control

- VERIFY: FD-SEC-003
  RolesGuard reads @Roles() decorator metadata via Reflector.
  If no roles are specified, the endpoint is accessible to all authenticated users.
  Admin-only operations (DELETE) require @Roles('ADMIN').

### Input Validation

- VERIFY: FD-SEC-004
  Global ValidationPipe configured with whitelist, forbidNonWhitelisted, and transform.
  All DTOs use class-validator decorators (>=10 instances across all DTOs).
  Unknown fields in request bodies are rejected with 400 Bad Request.

### Error Handling

- VERIFY: FD-SEC-005
  GlobalExceptionFilter (APP_FILTER) catches all unhandled exceptions.
  Error responses include correlationId but never include stack traces.
  HTTP status codes are preserved; unknown errors return 500.

### Rate Limiting

- ThrottlerModule configured with TTL and limit from environment variables.
  ThrottlerGuard registered as APP_GUARD applies to all endpoints.
  Monitoring endpoints use @SkipThrottle() to avoid false positives.

### CORS and Helmet

- CORS configured in main.ts with CORS_ORIGIN from environment.
- Helmet middleware adds security headers including CSP.

### Row-Level Security

- All tables have RLS ENABLED with FORCE.
- Policies use TEXT comparison for tenant_id column (no ::uuid cast).
- CREATE POLICY defined for every table with RLS enabled.
- SET LOCAL ensures migration safety.

### Shared Security Utilities

- VERIFY: FD-SHARED-001
  Shared package exports BCRYPT_SALT_ROUNDS, ALLOWED_REGISTRATION_ROLES,
  sanitizeLogContext (redacts password, token, secret, authorization fields),
  and validateEnvVars for startup validation.

### Architecture

- VERIFY: FD-ARCH-001
  Application uses layered architecture: controllers handle HTTP,
  services contain business logic, Prisma provides data access.
  All domain operations are tenant-scoped via request context.

## Cross-References

- See [authentication.md](authentication.md) for JWT and auth details
- See [data-model.md](data-model.md) for RLS policy implementation
- See [monitoring.md](monitoring.md) for public endpoint configuration
