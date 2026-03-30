# Cross-Layer Integration Specification

## Overview

The cross-layer integration verifies that all layers (L0-L8) work together correctly.
This includes the global provider chain, shared package utilization, cumulative regression,
and end-to-end request pipeline verification. See [security.md](security.md) for security details.

## Requirements

### VERIFY:EM-CROSS-001
Cross-layer integration test must verify the full pipeline:
- Auth guard enforced globally on all domain endpoints
- Public endpoints accessible without auth (health, auth routes)
- X-Response-Time header present on all responses
- CorrelationId present in error response bodies
- APP_VERSION from shared in health endpoint
- Validation errors return proper 400 responses

### VERIFY:EM-PERF-001
Pagination must use clampPagination from shared package.
MAX_PAGE_SIZE (100) clamps rather than rejects oversized requests.
DEFAULT_PAGE_SIZE (20) used when no limit specified.

### VERIFY:EM-PERF-002
ResponseTimeInterceptor must use performance.now() from perf_hooks.
Must set X-Response-Time header on ALL responses.
Must be registered as APP_INTERCEPTOR in AppModule.

### VERIFY:EM-AX-001
Accessibility tests must use real jest-axe imports rendering real components.
Tests must verify role="status" on loading states and role="alert" on error states.

### VERIFY:EM-AX-002
Keyboard navigation tests must use userEvent for Tab, Enter, Space interactions.
Tests must verify tab order between interactive elements.

## Global Provider Chain

The AppModule registers all global providers via NestJS DI:

1. **APP_GUARD: ThrottlerGuard** — rate limiting with named configs
2. **APP_GUARD: JwtAuthGuard** — JWT authentication with @Public() exemptions
3. **APP_FILTER: GlobalExceptionFilter** — error handling with sanitization
4. **APP_INTERCEPTOR: ResponseTimeInterceptor** — performance timing

Domain controllers do NOT use @UseGuards(JwtAuthGuard) — they rely on the global guard.

## Middleware Chain

Applied to all routes via AppModule.configure():
1. CorrelationIdMiddleware — sets correlation ID
2. RequestLoggingMiddleware — logs request details

## Shared Package Integration

The shared package (@event-management/shared) exports >= 8 utilities:
- APP_VERSION — health endpoint, settings page, server actions
- BCRYPT_SALT_ROUNDS — auth service, seed script
- ALLOWED_REGISTRATION_ROLES — auth service, register DTO
- DEFAULT_PAGE_SIZE — pagination utility
- createCorrelationId — correlation middleware
- formatLogEntry — request logging middleware
- sanitizeLogContext — global exception filter
- validateEnvVars — main.ts bootstrap
- clampPagination — pagination utility

Both apps/api and apps/web import from shared in >= 3 files each.

## Cumulative Regression

All L0-L8 checks must pass simultaneously:
- L0: Backend API with all CRUD operations
- L1: Integration tests with supertest
- L2: Frontend with loading/error states and accessibility
- L3: Specs with VERIFY/TRACED parity
- L4: Docker, CI/CD, migrations, seed
- L5: Monorepo with shared package
- L6: Security with Helmet, throttling, CORS, validation
- L7: Performance with response time, pagination, caching
- L8: Monitoring with logging, correlation, health, metrics

## Version Consistency

- APP_VERSION from shared package is used consistently
- Health endpoint returns version from shared
- Settings page displays version from shared
- No hardcoded version strings
