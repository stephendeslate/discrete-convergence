# Performance Specification

## Overview

Fleet Dispatch implements performance optimization through pagination, caching,
query optimization (N+1 prevention), response time tracking, and rate limiting.
Performance targets are validated through integration tests.

Cross-references: [data-model.md](data-model.md), [api-endpoints.md](api-endpoints.md)

## Pagination

All list endpoints support page and limit query parameters:
- Default page: 1, default limit: DEFAULT_PAGE_SIZE (20)
- Maximum limit: MAX_PAGE_SIZE (100)
- clampPagination utility enforces bounds
- paginationToSkipTake converts to Prisma skip/take
- Response format: { data, total, page, limit }

## Caching

- Cache-Control: private, max-age=30 on vehicle and route list endpoints
- Private caching ensures tenant-isolated responses are not shared
- 30-second max-age allows fresh data while reducing server load
- No caching on mutation endpoints (POST, PUT, DELETE)

## Query Optimization

### N+1 Prevention
Dispatch queries use Prisma include to eagerly load relations:
```
include: { vehicle: true, route: true, driver: true }
```
This loads all related entities in a single query instead of N+1 queries.

### Database Indexes
All tables have indexes on:
- tenantId (for tenant filtering)
- tenantId + status (for filtered queries)
Composite indexes support the most common query patterns.

### Parallel Queries
List endpoints use Promise.all for parallel count + findMany:
```
const [data, total] = await Promise.all([
  prisma.entity.findMany(...),
  prisma.entity.count(...)
]);
```

## Rate Limiting

ThrottlerModule configured with three tiers:
- short: 100 requests per 1 second (allows load testing)
- medium: 500 requests per 10 seconds
- long: 2000 requests per 60 seconds

Auth endpoints override with stricter limits:
- @Throttle({ short: { ttl: 1000, limit: 10 } }) on login/register

## Response Time

ResponseTimeInterceptor tracks all request durations:
- Sets X-Response-Time header (milliseconds)
- Performance test validates health check < 200ms
- Supports monitoring and alerting on slow responses

Cross-references: [monitoring.md](monitoring.md), [infrastructure.md](infrastructure.md)

## VERIFY Tags

- VERIFY: FD-PERF-001 — Keyboard navigation tests validate focus management
- VERIFY: FD-PERF-002 — Health check responds within 200ms
- VERIFY: FD-PERF-003 — Cache-Control headers set on list endpoints
- VERIFY: FD-PERF-004 — Concurrent requests handled without errors
- VERIFY: FD-PERF-005 — Pagination parameters parsed correctly
- VERIFY: FD-PERF-006 — Response time header included in responses
- VERIFY: FD-PERF-007 — N+1 query prevention via include on dispatches

## Load Testing

autocannon available as devDependency for load testing:
- Target endpoint: GET /vehicles with auth token
- Validates throughput under sustained load
- ThrottlerModule short limit (100/s) allows meaningful load testing
