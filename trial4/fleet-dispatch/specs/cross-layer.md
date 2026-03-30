# Cross-Layer Integration Specification

## Overview

Fleet Dispatch must maintain cross-layer integrity where all L0-L9 layer requirements
function simultaneously. This specification defines the global provider chain, shared
package usage, and the cross-layer integration test that verifies the full pipeline.

## Requirements

### VERIFY:FD-CRS-001 — AppModule with global providers

The AppModule must register all global providers via NestJS DI:
- APP_GUARD: ThrottlerGuard (rate limiting) + JwtAuthGuard (authentication)
- APP_FILTER: GlobalExceptionFilter (error handling with sanitization)
- APP_INTERCEPTOR: ResponseTimeInterceptor (performance monitoring)
Domain controllers must NOT use @UseGuards(JwtAuthGuard) — they rely on the global guard.

### VERIFY:FD-CRS-002 — Cross-layer integration test

The cross-layer integration test must verify the full pipeline using supertest:
1. Health endpoint returns APP_VERSION from shared
2. Readiness endpoint checks database connectivity
3. X-Response-Time header present on all responses
4. X-Correlation-ID header generated or preserved
5. Protected endpoints require authentication
6. Error responses include correlationId in body
7. Metrics endpoint returns expected fields
8. ValidationPipe rejects extra fields (forbidNonWhitelisted)

## Global Provider Chain

```
Request → CorrelationIdMiddleware → RequestLoggingMiddleware
  → ThrottlerGuard → JwtAuthGuard (@Public() check)
  → Controller → Service → Prisma
  → ResponseTimeInterceptor (outbound)
  → GlobalExceptionFilter (on error)
```

## Shared Package Usage

The @fleet-dispatch/shared package must be imported by >= 3 files in each app:

### apps/api imports:
1. auth.service.ts — BCRYPT_SALT_ROUNDS, ALLOWED_REGISTRATION_ROLES
2. work-order.service.ts — clampPagination
3. monitoring.controller.ts — APP_VERSION
4. correlation-id.middleware.ts — createCorrelationId
5. request-logging.middleware.ts — formatLogEntry
6. global-exception.filter.ts — sanitizeLogContext
7. main.ts — validateEnvVars

### apps/web imports:
1. lib/utils.ts — (uses shared indirectly via components)
2. lib/actions.ts — APP_VERSION
3. app/page.tsx — APP_VERSION

## Cumulative Verification

All L0-L8 checks must pass simultaneously:
- L0: Backend compiles, all services injectable
- L1: All tests pass (unit + integration)
- L2: Frontend builds, all routes have loading/error states
- L3: All VERIFY/TRACED tags paired, no orphans
- L4: Docker builds, CI config valid
- L5: Turborepo builds all packages
- L6: Security headers present, validation enforced
- L7: Response time headers, pagination clamping
- L8: Monitoring endpoints functional, logs structured

## Related Specifications

- See [security.md](security.md) for guard configuration
- See [monitoring.md](monitoring.md) for filter and middleware details
- See [infrastructure.md](infrastructure.md) for build verification
