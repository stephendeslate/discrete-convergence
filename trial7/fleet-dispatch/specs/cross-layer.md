# Cross-Layer Integration Specification

## Overview

Fleet Dispatch integrates all 10 layers (L0-L9) into a cohesive system.
This document verifies cross-cutting concerns and integration points
across the entire application stack.

## Global Provider Chain

- VERIFY: FD-CROSS-001 — AppModule registers APP_GUARD (ThrottlerGuard, JwtAuthGuard, RolesGuard), APP_FILTER (GlobalExceptionFilter), APP_INTERCEPTOR (ResponseTimeInterceptor)

## Performance Integration

- VERIFY: FD-PERF-001 — MAX_PAGE_SIZE constant (100) from shared package
- VERIFY: FD-PERF-002 — DEFAULT_PAGE_SIZE constant (20) from shared package
- VERIFY: FD-PERF-003 — PaginationParams interface defines page, pageSize, skip, take
- VERIFY: FD-PERF-004 — clampPagination() clamps page size to MAX_PAGE_SIZE (not reject)
- VERIFY: FD-PERF-005 — ResponseTimeInterceptor sets X-Response-Time header using performance.now()
- VERIFY: FD-PERF-006 — PaginatedQueryDto validates page and pageSize as optional number strings

## Integration Points

### Auth -> Domain Controllers
- Domain controllers do NOT use @UseGuards(JwtAuthGuard)
- Global JwtAuthGuard protects all non-@Public() endpoints
- @Public() applied to health and auth routes

### Security -> Monitoring
- GlobalExceptionFilter logs errors with correlationId via sanitizeLogContext
- Error responses include correlationId but not stack traces

### Shared Package -> Apps
- Both apps import >= 3 files from @fleet-dispatch/shared
- Shared exports: BCRYPT_SALT_ROUNDS, ALLOWED_REGISTRATION_ROLES, MAX_PAGE_SIZE,
  DEFAULT_PAGE_SIZE, APP_VERSION, createCorrelationId, formatLogEntry,
  sanitizeLogContext, validateEnvVars, clampPagination

### Performance -> All Controllers
- X-Response-Time header on ALL responses via APP_INTERCEPTOR
- Cache-Control headers on ALL list endpoints
- Pagination clamping on ALL findAll methods

### Monitoring -> Health
- GET /health returns APP_VERSION from shared
- GET /health/ready performs $queryRaw database check
- GET /metrics returns in-memory request/error counts

## Cumulative Verification

All L0-L8 checks must pass simultaneously:
- L0: DTOs validate, services use Prisma, auth works
- L1: Unit and integration tests pass
- L2: Frontend routes have loading.tsx and error.tsx
- L3: VERIFY/TRACED parity, zero orphans
- L4: Dockerfile, CI/CD, migrations, seed
- L5: Turborepo builds, shared package consumed
- L6: Helmet, rate limiting, CORS, validation
- L7: Response time, pagination, caching
- L8: Logging, correlation IDs, health, metrics

## Test Coverage

Cross-layer integration test verifies:
1. Health check (public, has version)
2. Database readiness (public)
3. Protected routes return 401 without token
4. CRUD operations with valid token
5. Error handling returns 404 with correlationId
6. RBAC enforcement (403 for wrong role)
7. Metrics endpoint accessible
8. X-Response-Time headers present
9. Cache-Control headers on list endpoints
