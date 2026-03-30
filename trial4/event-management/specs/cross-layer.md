# Cross-Layer Integration Specification

## Overview

This document specifies how all layers integrate: global provider chain, shared
package consumption, testing strategy, and performance requirements. The platform
uses Turborepo for build orchestration across apps/api, apps/web, and packages/shared.

See [monitoring.md](monitoring.md) for monitoring layer details.
See [security.md](security.md) for security layer details.

## Requirements

### VERIFY:EM-CROSS-001 — APP_VERSION in Health and CLAUDE.md
The `APP_VERSION` constant from `@event-management/shared` is used in:
- MonitoringService health endpoint response
- MonitoringService metrics endpoint response
- CLAUDE.md project documentation
Ensures version consistency across all reporting surfaces.

### VERIFY:EM-CROSS-002 — Shared Package Barrel Export
The shared package exports exactly 8 utilities via `packages/shared/src/index.ts`:
BCRYPT_SALT_ROUNDS, ALLOWED_REGISTRATION_ROLES, APP_VERSION, clampPagination,
createCorrelationId, formatLogEntry, sanitizeLogContext, validateEnvVars.
All exports are consumed by at least one file in apps/api or apps/web.
Zero dead exports.

### VERIFY:EM-CROSS-003 — Global Provider Chain in AppModule
AppModule registers all global providers via NestJS DI (not main.ts):
- APP_GUARD: ThrottlerGuard (rate limiting) + JwtAuthGuard (authentication)
- APP_FILTER: GlobalExceptionFilter (error handling with correlationId)
- APP_INTERCEPTOR: ResponseTimeInterceptor (X-Response-Time header)

### VERIFY:EM-CROSS-004 — @Public() Decorator Pattern
The `@Public()` decorator sets metadata to bypass the global JwtAuthGuard.
Used on: auth endpoints (login, register, refresh), health endpoints,
metrics endpoint, and public discovery endpoint.

### VERIFY:EM-CROSS-005 — JwtAuthGuard Global Bypass
The JwtAuthGuard checks for IS_PUBLIC_KEY metadata via Reflector. If the
route or controller has @Public(), authentication is skipped. Domain
controllers do NOT use @UseGuards(JwtAuthGuard) — they rely on the global guard.

### VERIFY:EM-CROSS-006 — Cross-Layer Integration Test
The cross-layer integration test verifies the full pipeline:
- Auth enforcement on protected endpoints
- X-Response-Time header on all responses
- Correlation ID handling
- Health endpoint with APP_VERSION
- DB readiness check
- Metrics with version and counts
- Invalid token rejection
- Request body validation

### VERIFY:EM-PERF-001 — Pagination Clamping
The `clampPagination()` function from shared clamps (not rejects) pagination:
- Page: minimum 1, defaults to 1
- PageSize: minimum 1, maximum MAX_PAGE_SIZE (100), defaults to 20
MAX_PAGE_SIZE and DEFAULT_PAGE_SIZE are internal to shared (not re-exported).

### VERIFY:EM-PERF-002 — Response Time Interceptor
The ResponseTimeInterceptor uses `performance.now()` from `perf_hooks` to
measure request duration. Sets X-Response-Time header on ALL responses.
Registered as APP_INTERCEPTOR in AppModule providers.

### VERIFY:EM-PERF-003 — Cache-Control on List Endpoints
All list endpoints (findAll methods) include Cache-Control headers:
- Events: `public, max-age=30, stale-while-revalidate=60`
- Venues: `public, max-age=30, stale-while-revalidate=60`
- Registrations: `public, max-age=10, stale-while-revalidate=30`
- Notifications: `public, max-age=10, stale-while-revalidate=30`
- Public discovery: `public, max-age=60, stale-while-revalidate=120`

## Testing Strategy

### VERIFY:EM-TEST-001 — Auth Integration Tests
Auth integration tests use supertest with real AppModule compilation.
Tests verify: empty body rejection, invalid email rejection, ADMIN role
rejection, missing required fields, invalid refresh token.

### VERIFY:EM-TEST-002 — Domain Integration Tests
Event integration tests use supertest with real AppModule compilation.
Tests verify: authentication required for protected endpoints, public
discovery endpoint accessible without auth.

### VERIFY:EM-TEST-003 — Auth Service Unit Tests
Auth service unit tests mock Prisma with jest.fn() typed returns.
Tests verify: non-existent user, wrong password, valid login, ADMIN role
rejection, duplicate email detection. Imports BCRYPT_SALT_ROUNDS from shared.

### VERIFY:EM-TEST-004 — Event Service Unit Tests
Event service unit tests mock Prisma event methods.
Tests verify: NotFoundException for missing events, publish only drafts,
cancel rejects completed events, paginated results.

### VERIFY:EM-TEST-005 — Venue Service Unit Tests
Venue service unit tests mock Prisma venue methods.
Tests verify: NotFoundException for missing venues, paginated results,
venue creation.

### VERIFY:EM-TEST-006 — Monitoring Integration Tests
Monitoring tests use supertest (not unit-only) with real AppModule.
Tests verify: health returns status/version/uptime/timestamp, readiness
returns database status, metrics return counts and version.

### VERIFY:EM-TEST-007 — Security Integration Tests
Security tests use supertest to verify: unauthenticated rejection,
invalid JWT rejection, forbidNonWhitelisted enforcement, oversized
input rejection, public endpoint access.

### VERIFY:EM-TEST-008 — Performance Integration Tests
Performance tests use supertest to verify: X-Response-Time header format,
presence on all responses, pagination query parameter acceptance.

### VERIFY:EM-TEST-009 — Registration Service Unit Tests
Registration service unit tests mock Prisma methods. Tests verify:
NotFoundException for missing events, BadRequestException for closed events,
ConflictException for sold-out tickets, idempotent check-in behavior.

## Shared Package Consumption

apps/api imports from shared (3+ files):
- main.ts: validateEnvVars
- auth/auth.service.ts: BCRYPT_SALT_ROUNDS, ALLOWED_REGISTRATION_ROLES
- auth/dto/register.dto.ts: ALLOWED_REGISTRATION_ROLES
- event/event.service.ts: clampPagination
- venue/venue.service.ts: clampPagination
- registration/registration.service.ts: clampPagination
- notification/notification.service.ts: clampPagination
- monitoring/monitoring.service.ts: APP_VERSION
- common/correlation-id.middleware.ts: createCorrelationId
- common/request-logging.middleware.ts: formatLogEntry
- common/global-exception.filter.ts: sanitizeLogContext

apps/web imports from shared (3+ files):
- lib/actions.ts: APP_VERSION
