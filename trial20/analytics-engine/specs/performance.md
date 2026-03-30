# Performance Specification

## Overview

The Analytics Engine is designed for responsive performance with sub-100ms response
times for health endpoints and efficient database queries. Performance is monitored
via response time headers, metrics collection, and structured logging.

See also: monitoring.md for metrics endpoint and response time tracking.
See also: infrastructure.md for Docker and deployment optimization.

## Response Time Targets

- Health endpoints: < 50ms
- Auth endpoints: < 200ms (bcrypt hashing dominates)
- CRUD list endpoints: < 100ms (with pagination)
- CRUD single entity: < 50ms

## Performance Features

VERIFY: AE-PERF-001 — Response time header included on all responses
VERIFY: AE-PERF-002 — Pagination prevents unbounded query results
VERIFY: AE-PERF-003 — Database indexes on tenantId and composite keys

### Response Time Tracking
- ResponseTimeInterceptor measures elapsed time per request
- X-Response-Time header included in milliseconds
- Metric aggregation via MonitoringService.recordRequest()

### Database Optimization
- @@index on tenantId for every model
- @@index on composite keys (tenantId + status)
- @@index on dashboardId for widget lookups
- Pagination with MAX_PAGE_SIZE (100) limit
- clampPagination prevents oversized page requests

### Rate Limiting
- ThrottlerGuard prevents abuse and DoS
- 100 req/sec default for general endpoints
- 10 req/sec for auth endpoints
- Prevents resource exhaustion

VERIFY: AE-PERF-004 — Rate limiting prevents resource exhaustion
VERIFY: AE-PERF-005 — Correlation IDs enable request tracing for performance debugging
VERIFY: AE-PERF-006 — Structured logging captures duration for performance analysis

## Build Performance

- Turborepo caches build artifacts
- pnpm uses content-addressable store for fast installs
- Shared package builds first (dependency ordering)
- Parallel lint execution

## Frontend Performance

- React server components reduce client JavaScript
- Streaming with loading.tsx suspense boundaries
- Next.js automatic code splitting per route
- transpilePackages for shared package optimization

## Load Testing

- Performance tests verify response time headers
- Rapid sequential requests test stability
- Correlation ID uniqueness verified across requests
- Integration tests cover full request pipeline
