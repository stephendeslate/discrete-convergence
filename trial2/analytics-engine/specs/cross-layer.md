# Cross-Layer Integration Specification

## Overview

The Analytics Engine cross-layer integration verifies that all layers (L0-L9) work
together correctly. This includes the global provider chain, middleware ordering,
shared package utilization, and cumulative regression testing.

## Global Provider Chain

The AppModule registers three categories of global providers:

1. **APP_GUARD**: ThrottlerGuard + JwtAuthGuard
   - ThrottlerGuard enforces rate limits on all routes
   - JwtAuthGuard enforces authentication, respecting @Public()
   - Domain controllers do NOT use @UseGuards

2. **APP_FILTER**: GlobalExceptionFilter
   - Catches all exceptions
   - Sanitizes request body before logging
   - Includes correlationId in error response
   - Never exposes stack traces

3. **APP_INTERCEPTOR**: ResponseTimeInterceptor
   - Measures response time using performance.now()
   - Sets X-Response-Time header on all responses

## Request Pipeline

```
Request → Helmet (CSP headers)
  → CORS check
  → CorrelationIdMiddleware (set/preserve X-Correlation-ID)
  → RequestLoggingMiddleware (log with formatLogEntry)
  → ThrottlerGuard (rate limiting)
  → JwtAuthGuard (auth check, skip if @Public)
  → ValidationPipe (whitelist + forbidNonWhitelisted)
  → Controller handler
  → ResponseTimeInterceptor (set X-Response-Time)
  → Response
```

On error:
```
Exception → GlobalExceptionFilter
  → sanitizeLogContext(request.body)
  → Log error with correlationId
  → Return sanitized error with correlationId
```

## Requirements

<!-- VERIFY:AE-TEST-001 — Auth integration tests with supertest and real AppModule -->
- REQ-TEST-001: Auth integration tests must compile real AppModule

<!-- VERIFY:AE-TEST-002 — Dashboard integration tests with supertest -->
- REQ-TEST-002: Dashboard tests must verify CRUD, publish, archive

<!-- VERIFY:AE-TEST-003 — Cross-layer test verifies full pipeline -->
- REQ-TEST-003: Cross-layer test must verify:
  - Auth → CRUD → error handling → correlation IDs → response time → health

<!-- VERIFY:AE-TEST-004 — Monitoring integration tests with supertest -->
- REQ-TEST-004: Monitoring tests must use supertest (not unit-only)

<!-- VERIFY:AE-TEST-005 — Security integration tests with supertest -->
- REQ-TEST-005: Security tests must verify auth rejection, validation, headers

<!-- VERIFY:AE-TEST-006 — Performance tests verify X-Response-Time, pagination, caching -->
- REQ-TEST-006: Performance tests must verify response time header and pagination clamping

<!-- VERIFY:AE-TEST-007 — Dashboard service unit test with mocked Prisma -->
- REQ-TEST-007: Unit test must mock PrismaService with jest.fn()

<!-- VERIFY:AE-TEST-008 — DataSource service unit test with mocked Prisma -->
- REQ-TEST-008: Unit test must mock PrismaService including $executeRaw

## Shared Package Utilization

Both apps must import from shared:

**apps/api imports (>= 3 files):**
- auth/auth.service.ts: BCRYPT_SALT_ROUNDS
- auth/dto/register.dto.ts: ALLOWED_REGISTRATION_ROLES
- monitoring/monitoring.service.ts: APP_VERSION
- common/correlation-id.middleware.ts: createCorrelationId
- common/request-logging.middleware.ts: formatLogEntry
- common/global-exception.filter.ts: sanitizeLogContext
- main.ts: validateEnvVars
- common/pagination.utils.ts: clampPagination

**apps/web imports (>= 3 files):**
- lib/actions.ts: APP_VERSION, validateEnvVars
- app/globals.css: (TRACED from dark mode comment)

## Cumulative Verification

All prior layer requirements must hold simultaneously:
- L0: Backend API — all convention gates pass
- L1: Integration tests — all test files compile and run
- L2: Frontend — loading/error states, shadcn components, dark mode
- L3: Specs — VERIFY/TRACED parity, >= 35 tags
- L4: Infrastructure — Dockerfile, CI, seed, migrations
- L5: Monorepo — shared exports consumed, turbo in devDeps
- L6: Security — Helmet, throttler, CORS, validation
- L7: Performance — response time, pagination, caching
- L8: Monitoring — Pino, correlation IDs, health, metrics

## Version Consistency

APP_VERSION from shared must appear in:
- Health endpoint response (monitoring service)
- CLAUDE.md documentation
- Server actions (web app)
