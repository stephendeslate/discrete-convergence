# Cross-Layer Integration Specification

## Overview

This specification documents how the layers of the Fleet Dispatch
application integrate and verify each other. Cross-layer testing ensures
that no layer operates in isolation and that the full request pipeline
functions correctly end-to-end.

## Full Pipeline Test

<!-- VERIFY: FD-CROSS-001 -->
The cross-layer integration test (`cross-layer.integration.spec.ts`)
verifies the complete request pipeline:
1. Authentication: register user, login, receive JWT token
2. CRUD operations: create, read, update, delete with auth headers
3. Error handling: invalid requests return sanitized errors
4. Correlation IDs: present in all responses including errors
5. Response time: X-Response-Time header on all responses
6. Health checks: monitoring endpoints accessible without auth

## Performance Integration

<!-- VERIFY: FD-PERF-001 -->
MAX_PAGE_SIZE is set to 100 in the shared constants and enforced
by the pagination utility across all list endpoints.

<!-- VERIFY: FD-PERF-002 -->
DEFAULT_PAGE_SIZE is set to 20, used when no page size is specified
in query parameters.

<!-- VERIFY: FD-PERF-003 -->
The `parsePagination()` function from the shared package clamps
page size to MAX_PAGE_SIZE and computes skip/take values for Prisma.

<!-- VERIFY: FD-PERF-004 -->
The `getPagination()` utility in the API wraps parsePagination for
use in NestJS controllers with query parameter extraction.

<!-- VERIFY: FD-PERF-005 -->
ResponseTimeInterceptor uses `performance.now()` from `perf_hooks`
to measure request duration and sets the `X-Response-Time` header
on all responses in milliseconds.

## Performance Testing

<!-- VERIFY: FD-PERF-006 -->
Performance integration tests verify:
- X-Response-Time header is present on responses
- Pagination clamps page size to MAX_PAGE_SIZE
- Cache-Control headers are set on vehicle list responses
- Default pagination values are applied correctly

## Layer Dependencies

### Shared Package (packages/shared)

The shared package provides cross-cutting utilities consumed by both
the API and web applications:

- Constants: BCRYPT_SALT_ROUNDS, ALLOWED_REGISTRATION_ROLES, MAX_PAGE_SIZE,
  DEFAULT_PAGE_SIZE, APP_VERSION, JWT_EXPIRES_IN, THROTTLE_*
- Utilities: createCorrelationId, formatLogEntry, sanitizeLogContext,
  validateEnvVars, parsePagination

### API to Shared

The API imports from shared for:
- Authentication (salt rounds, allowed roles, JWT expiry)
- Rate limiting (throttle TTL and limits)
- Monitoring (correlation IDs, log formatting, sanitization)
- Pagination (page size constants, parse function)
- Infrastructure (env validation, app version)

### Web to Shared

The web app imports from shared for:
- Pagination constants (MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE)
- App version display

## Cross-References

- See [authentication.md](authentication.md) for auth flow details
- See [monitoring.md](monitoring.md) for observability pipeline
- See [security.md](security.md) for defense-in-depth layers
- See [data-model.md](data-model.md) for domain entity definitions
