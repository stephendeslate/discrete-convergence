# Performance Specification

## Overview

The Event Management Platform implements performance optimizations through
pagination, response time tracking, caching headers, connection pooling,
and efficient query patterns.

## Response Time

VERIFY: EM-PERF-001 — Health endpoint responds under 200ms

Service Level Objectives:
- Health check: < 200ms
- List endpoints (paginated): < 500ms
- Single entity GET: < 200ms
- Create/Update/Delete: < 500ms

The X-Response-Time header is set on every response by the
ResponseTimeInterceptor for monitoring and alerting.

See: monitoring.md for response time tracking
See: cross-layer.md for timing header verification

## Pagination

VERIFY: EM-PERF-002 — Pagination clamps limit to MAX_PAGE_SIZE

All list endpoints support pagination via query parameters:
- page: page number (default: 1, minimum: 1)
- limit: items per page (default: 20, maximum: 100)

The clampPagination function from the shared package enforces bounds.
Prisma queries use skip/take based on clamped values.

Response format:
```json
{
  "data": [...],
  "total": 150,
  "page": 1,
  "limit": 20
}
```

See: api-endpoints.md for endpoint details
See: edge-cases.md for pagination boundary conditions

## Caching

VERIFY: EM-PERF-003 — List endpoints include Cache-Control response header

List endpoints set Cache-Control: public, max-age=60 to enable client and
CDN caching of frequently accessed data. Individual entity endpoints do not
set cache headers to ensure fresh data on direct access.

## Response Time Interceptor

VERIFY: EM-PERF-004 — ResponseTimeInterceptor measures using Date.now() delta

The interceptor:
1. Records start time via Date.now()
2. Pipes through the response observable
3. Calculates duration on completion
4. Sets X-Response-Time header with "{N}ms" format

## Pagination Utility

VERIFY: EM-PERF-005 — Pagination utility integrates shared clampPagination

The API's pagination utility wraps the shared clampPagination function:
- Validates and clamps input parameters
- Calculates Prisma skip value: (page - 1) * limit
- Returns { skip, take, page, limit } for direct Prisma usage

## Database Performance

Query optimizations:
- Indexes on tenantId for all tables (every query is tenant-scoped)
- Indexes on status for filtered listings
- Composite indexes for common query patterns
- count() alongside findMany for accurate totals
- Connection pooling via Prisma's built-in pool

See: data-model.md for index definitions
See: infrastructure.md for database configuration

## Load Testing

The API supports autocannon for load testing:
- ThrottlerModule short limit of 100/sec allows realistic load testing
- Health endpoint at /health is the primary load test target
- Integration tests verify 50 concurrent health check requests

See: security.md for rate limiting configuration
See: edge-cases.md for high-load scenarios
