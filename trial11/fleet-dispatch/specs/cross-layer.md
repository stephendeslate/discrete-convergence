# Cross-Layer Integration Specification

## Overview

Cross-layer integration verifies that all layers of Fleet Dispatch work together
correctly. This includes the global provider chain, shared package utilization,
cumulative regression checks, and full pipeline verification.

## Global Provider Chain

- VERIFY: FD-CROSS-001 — APP_GUARD: ThrottlerGuard + JwtAuthGuard in AppModule
- VERIFY: FD-CROSS-002 — APP_FILTER: GlobalExceptionFilter in AppModule
- VERIFY: FD-CROSS-003 — APP_INTERCEPTOR: ResponseTimeInterceptor in AppModule

All providers registered via NestJS DI in AppModule providers array.
Domain controllers do NOT use @UseGuards(JwtAuthGuard) — they rely on global guard.
@Public() decorator exempts specific routes from auth.

## Shared Package Utilization

- VERIFY: FD-CROSS-004 — Shared package consumed by >= 3 files in each app

### API Imports from Shared
1. auth.service.ts — BCRYPT_SALT_ROUNDS, ALLOWED_REGISTRATION_ROLES
2. monitoring.controller.ts — APP_VERSION, createCorrelationId
3. common/global-exception.filter.ts — sanitizeLogContext
4. common/pagination.utils.ts — clampPagination, MAX_PAGE_SIZE
5. common/request-logging.middleware.ts — formatLogEntry

### Web Imports from Shared
1. lib/actions.ts — API route constants used with fetch
2. app/layout.tsx — APP_VERSION
3. lib/utils.ts — helper utilities

## Full Pipeline Test

- VERIFY: FD-CROSS-005 — Cross-layer test: auth -> CRUD -> error -> correlation -> timing -> health

The cross-layer integration test verifies:
1. Auth flow: register -> login -> receive JWT
2. CRUD operations with auth headers
3. Error handling with sanitized responses
4. Correlation ID propagation through request chain
5. Response time headers present
6. Health and readiness endpoints accessible
7. DB connectivity via /health/ready

## Cumulative Regression

- VERIFY: FD-CROSS-006 — All L0-L8 checks pass simultaneously

### Regression Checks
- L0: All CRUD endpoints respond correctly
- L1: Integration tests pass
- L2: Frontend builds and renders
- L3: Spec traceability parity maintained
- L4: Docker and CI configs valid
- L5: Monorepo build succeeds
- L6: Security guards active
- L7: Performance headers present
- L8: Monitoring endpoints respond

## Version Consistency

- APP_VERSION from shared used in health endpoint response
- APP_VERSION referenced in CLAUDE.md

## Error Path Verification

- Auth errors return 401 with correlationId
- Validation errors return 400 with correlationId
- Not found errors return 404 with correlationId
- Forbidden errors return 403 with correlationId
- All error responses exclude stack traces

## Middleware Ordering

1. Helmet (CSP headers)
2. CORS
3. CorrelationIdMiddleware
4. RequestLoggingMiddleware
5. ThrottlerGuard
6. JwtAuthGuard
7. RolesGuard
8. ValidationPipe
9. ResponseTimeInterceptor
10. GlobalExceptionFilter
