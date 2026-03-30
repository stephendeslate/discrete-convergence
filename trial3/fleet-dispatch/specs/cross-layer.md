# Cross-Layer Integration Specification

## Overview

This document specifies the cross-layer integration requirements
for Fleet Dispatch, ensuring all layers work together correctly.

## Global Provider Chain

<!-- VERIFY:FD-ARCH-001 — AppModule configures APP_GUARD, APP_FILTER, APP_INTERCEPTOR -->

### APP_GUARD
- ThrottlerGuard: Rate limiting (default + auth configs)
- JwtAuthGuard: JWT authentication with @Public() exemption

### APP_FILTER
- GlobalExceptionFilter: Sanitized errors with correlationId

### APP_INTERCEPTOR
- ResponseTimeInterceptor: X-Response-Time header on all responses

All providers registered via NestJS DI in AppModule, not in main.ts.

## Performance

<!-- VERIFY:FD-PERF-001 — clampPagination from shared clamps pageSize to MAX_PAGE_SIZE -->
<!-- VERIFY:FD-PERF-002 — ResponseTimeInterceptor uses performance.now() from perf_hooks -->

### Response Time
- ResponseTimeInterceptor measures request processing time
- Uses performance.now() from perf_hooks for precision
- Sets X-Response-Time header in milliseconds

### Pagination
- MAX_PAGE_SIZE=100, DEFAULT_PAGE_SIZE=20 from shared
- Clamps (not rejects) out-of-range page sizes
- All list endpoints use clampPagination

### Cache-Control
- All list endpoints set `Cache-Control: private, max-age=30`
- Notification lists use shorter max-age=10

### Database Performance
- @@index on all foreign keys
- Composite indexes on (companyId, status)
- Prisma include for N+1 prevention
- connection_limit in DATABASE_URL

## Shared Package Integration

### Exports Used

The shared package exports >= 8 utilities consumed by both apps:

| Export | Used In |
|--------|---------|
| APP_VERSION | api (monitoring), web (nav) |
| BCRYPT_SALT_ROUNDS | api (auth, seed) |
| ALLOWED_REGISTRATION_ROLES | api (register DTO) |
| MAX_PAGE_SIZE | api (pagination) |
| DEFAULT_PAGE_SIZE | api (pagination) |
| createCorrelationId | api (middleware) |
| formatLogEntry | api (request logging) |
| sanitizeLogContext | api (exception filter) |
| validateEnvVars | api (main.ts), web (actions) |
| clampPagination | api (services) |

### Import Verification
- API: >= 3 files import from @fleet-dispatch/shared
- Web: >= 3 files import from @fleet-dispatch/shared

## VERIFY/TRACED Conventions

- Prefix: FD-
- TRACED tags only in .ts/.tsx files
- Every TRACED must match a VERIFY in specs/
- Every VERIFY must match a TRACED in source

## Cumulative Layer Checks

All L0-L8 checks must pass simultaneously:
- L0: NestJS API with full CRUD, DTOs, auth
- L1: Integration + unit tests
- L2: Next.js frontend with shadcn/ui
- L3: Specs with VERIFY/TRACED parity
- L4: Docker, CI/CD, migrations, seed
- L5: Turborepo monorepo, shared package
- L6: Helmet, throttler, CORS, validation
- L7: Response time, pagination, caching
- L8: Pino logging, correlation IDs, health, metrics
- L9: Cross-layer integration test

## Shared Constants

<!-- VERIFY:FD-CONST-001 — APP_VERSION exported from shared constants -->
<!-- VERIFY:FD-CONST-002 — BCRYPT_SALT_ROUNDS set to 12 in shared constants -->
