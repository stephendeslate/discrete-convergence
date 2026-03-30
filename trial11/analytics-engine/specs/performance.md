# Performance Specification

## Overview

The Analytics Engine enforces performance constraints through pagination limits,
response time tracking, and resource-aware defaults. These controls prevent
denial-of-service via unbounded queries and provide observability into API latency.

See also: [Monitoring](monitoring.md) for metrics collection.
See also: [API Endpoints](api-endpoints.md) for paginated list endpoints.

## Pagination Constants

VERIFY: AE-PERF-001
MAX_PAGE_SIZE constant (100) exported from shared package prevents unbounded queries.

VERIFY: AE-PERF-002
DEFAULT_PAGE_SIZE constant (20) exported from shared package provides sensible defaults.

## Pagination Parsing

VERIFY: AE-PERF-003
parsePagination function clamps pageSize to MAX_PAGE_SIZE and ensures minimum of 1.

VERIFY: AE-PERF-004
parsePagination returns skip (offset) and take (limit) for Prisma queries.

## Response Time Tracking

VERIFY: AE-PERF-005
ResponseTimeInterceptor (APP_INTERCEPTOR) sets X-Response-Time header on all responses.

## Pagination Behavior

### Query Parameter Handling

- `page` defaults to 1 if not provided or invalid
- `pageSize` defaults to DEFAULT_PAGE_SIZE (20) if not provided
- `pageSize` is clamped to MAX_PAGE_SIZE (100) if exceeded
- Negative `page` values are treated as page 1
- The `skip` value is calculated as `(page - 1) * take`

### Response Time Header

- Format: `Xms` where X is the elapsed time in milliseconds
- Measured from request start to response completion
- Applied globally via NestJS interceptor pipeline
- Available on all endpoints including public routes

## Integration with Domain Services

All list endpoints (dashboards, data sources, widgets) use parsePagination
to convert query parameters into Prisma-compatible skip/take values. This
ensures consistent pagination behavior across the entire API surface.

The ResponseTimeInterceptor runs in the NestJS interceptor pipeline after
guards but before route handlers, ensuring accurate timing measurement
that includes service and database execution time.
