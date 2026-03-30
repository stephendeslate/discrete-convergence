# Cross-Layer Integration Specification

## Overview

Cross-layer integration verifies that all application layers work together
seamlessly: authentication, CRUD operations, error handling, correlation IDs,
response time tracking, health checks, and database connectivity.

See also: [Authentication](authentication.md) for JWT flow.
See also: [Security](security.md) for guard chain.
See also: [Monitoring](monitoring.md) for health endpoints.

## Global Provider Chain

VERIFY: AE-CROSS-001
AppModule registers global providers via NestJS DI:
- APP_GUARD: ThrottlerGuard (rate limiting)
- APP_GUARD: JwtAuthGuard (authentication)
- APP_GUARD: RolesGuard (authorization)
- APP_FILTER: GlobalExceptionFilter (error handling)
- APP_INTERCEPTOR: ResponseTimeInterceptor (performance tracking)

Domain controllers do NOT use @UseGuards(JwtAuthGuard) — they rely on
the global guard. @Public() decorator exempts specific routes.

## Integration Tests

VERIFY: AE-CROSS-002
Cross-layer integration tests verify the full pipeline:
- Auth → CRUD: Create dashboard with valid JWT
- Error handling: Unauthenticated request returns correlation ID
- Health: Endpoint includes APP_VERSION from shared
- DB check: health/ready performs $queryRaw
- Tenant isolation: Different JWT tenantIds scope queries differently
- Rate limiting: Health endpoints exempt from throttle
- Response time: All responses include X-Response-Time header

## Shared Package Usage

The shared package (@analytics-engine/shared) is used by 3+ files in each app:
- api: imports BCRYPT_SALT_ROUNDS, ALLOWED_REGISTRATION_ROLES, MAX_PAGE_SIZE,
  DEFAULT_PAGE_SIZE, APP_VERSION, createCorrelationId, formatLogEntry,
  sanitizeLogContext, validateEnvVars
- web: imports APP_VERSION

All named exports from packages/shared/src/index.ts have at least one consumer
outside the shared package. Zero dead exports.

## Performance Integration

VERIFY: AE-PERF-001
parsePagination utility clamps page size to MAX_PAGE_SIZE and computes
skip/take for Prisma queries. Imported from shared via MAX_PAGE_SIZE.

VERIFY: AE-PERF-002
ResponseTimeInterceptor uses performance.now() from perf_hooks
to measure and set X-Response-Time header on all responses.

VERIFY: AE-PERF-003
DashboardController sets Cache-Control: private, max-age=30 on list endpoints.
All controllers with findAll set Cache-Control headers.

VERIFY: AE-PERF-004
Performance integration tests verify:
- X-Response-Time header presence and format
- Default pagination (DEFAULT_PAGE_SIZE)
- Page size clamping (MAX_PAGE_SIZE)
- Cache-Control headers on all list endpoints

## Frontend Integration

VERIFY: AE-FI-001
Frontend defines API route constants as single-quoted strings:
- '/dashboards', '/widgets', '/data-sources'
These match backend controller prefixes.

VERIFY: AE-FI-002
Login server action stores token via cookies().set after successful
authentication, with httpOnly and secure flags.

VERIFY: AE-FI-003
Register server action stores token via cookies().set after successful
registration, with httpOnly and secure flags.

VERIFY: AE-FI-004
Protected server actions read token via cookies().get('token'),
redirect to /login if missing, and pass Authorization: Bearer header.

## Accessibility Integration

VERIFY: AE-AX-003
Accessibility tests use jest-axe for automated a11y validation
and userEvent for keyboard navigation testing.
Tests cover Button, Form, Alert, Loading, and Error components.
