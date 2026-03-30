# Cross-Layer Integration Specification

## Overview

This specification defines the integration requirements that span
multiple architectural layers. Cross-layer tests verify that all
subsystems work together correctly.

See [security.md](security.md) for security provider details.
See [monitoring.md](monitoring.md) for monitoring provider details.
See [infrastructure.md](infrastructure.md) for shared package details.

## Requirements

### VERIFY:AE-CRS-001
AppModule MUST register all global providers via NestJS DI:
- APP_GUARD: ThrottlerGuard + JwtAuthGuard
- APP_FILTER: GlobalExceptionFilter
- APP_INTERCEPTOR: ResponseTimeInterceptor
Domain controllers MUST NOT use @UseGuards(JwtAuthGuard) directly.

### VERIFY:AE-CRS-002
Cross-layer integration test MUST verify the full pipeline:
auth → CRUD → error handling → correlation IDs → response time →
health → DB check. Using supertest with real AppModule.

### VERIFY:AE-PRF-001
ResponseTimeInterceptor MUST be registered as APP_INTERCEPTOR.
Uses performance.now() from perf_hooks. Sets X-Response-Time header.

### VERIFY:AE-PRF-002
Pagination MUST clamp (not reject) out-of-range values.
MAX_PAGE_SIZE=100, DEFAULT_PAGE_SIZE=20 from shared constants.
clampPagination utility used by all paginated endpoints.

### VERIFY:AE-PRF-003
Cache-Control headers MUST be set on ALL list endpoints
(every controller with findAll).

### VERIFY:AE-PRF-004
Data source list endpoint MUST include Cache-Control header
in response metadata.

## Provider Chain

The global provider chain ensures consistent behavior across all requests:

1. **ThrottlerGuard** (APP_GUARD) — rate limiting
2. **JwtAuthGuard** (APP_GUARD) — authentication (checks @Public())
3. **GlobalExceptionFilter** (APP_FILTER) — error handling
4. **ResponseTimeInterceptor** (APP_INTERCEPTOR) — performance timing

## Middleware Chain

Applied to all routes via AppModule.configure():
1. **CorrelationIdMiddleware** — correlation ID management
2. **RequestLoggingMiddleware** — structured request logging

## Shared Package Integration

Both apps must import from @analytics-engine/shared:

### apps/api imports (>= 3 files):
- auth.service.ts: BCRYPT_SALT_ROUNDS
- main.ts: validateEnvVars
- monitoring/monitoring.controller.ts: APP_VERSION
- common/correlation-id.middleware.ts: createCorrelationId
- common/request-logging.middleware.ts: formatLogEntry
- common/global-exception.filter.ts: sanitizeLogContext
- common/pagination.utils.ts: clampPagination
- auth/dto/register.dto.ts: ALLOWED_REGISTRATION_ROLES
- widget/widget.service.ts: MAX_WIDGETS_PER_DASHBOARD

### apps/web imports (>= 3 files):
- lib/actions.ts: validateEnvVars
- app/globals.css: (dark mode spec reference)
- test files: APP_VERSION, shared constants

## Testing Requirements

### VERIFY:AE-TST-001
Auth integration tests MUST use supertest with real AppModule compilation.

### VERIFY:AE-TST-002
Dashboard integration tests MUST use supertest with real AppModule.

### VERIFY:AE-TST-003
Dashboard unit tests MUST mock Prisma with jest.fn() typed returns.

### VERIFY:AE-TST-004
Data source unit tests MUST mock Prisma with jest.fn() typed returns.

### VERIFY:AE-TST-005
Auth unit tests MUST import BCRYPT_SALT_ROUNDS from shared (no hardcoded values).

### VERIFY:AE-TST-006
Monitoring tests MUST be supertest integration tests (not unit-only).

### VERIFY:AE-TST-007
Security tests MUST verify CSP headers, validation, auth requirements.

### VERIFY:AE-TST-008
Performance tests MUST verify X-Response-Time header presence.

### VERIFY:AE-TST-009
Accessibility tests MUST use real jest-axe rendering real components.

### VERIFY:AE-TST-010
Keyboard navigation tests MUST use userEvent for tab/enter/space.
