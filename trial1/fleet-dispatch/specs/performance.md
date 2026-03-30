# Performance Specification

> **Cross-references:** See [api-endpoints.md](api-endpoints.md), [monitoring.md](monitoring.md), [data-model.md](data-model.md), [infrastructure.md](infrastructure.md)

## Overview

Fleet Dispatch implements performance optimizations through response time
measurement, pagination with bounded page sizes, cache headers, and
indexed database queries. Performance is validated through dedicated tests.

## Response Time Measurement

### ResponseTimeInterceptor
- VERIFY:FD-PERF-001 — ResponseTimeInterceptor as APP_INTERCEPTOR with perf_hooks
- Uses Node.js perf_hooks (performance.now()) for high-resolution timing
- Registered as APP_INTERCEPTOR in AppModule — measures all requests
- Records timing via MetricsService.recordResponseTime()
- Sets X-Response-Time header on responses

## Performance Tests

### Test Suite
- VERIFY:FD-PERF-002 — Performance tests for response time and pagination
- Tests ResponseTimeInterceptor instantiation and metric recording
- Tests MetricsService average calculation and buffer management
- Tests clampPagination bounds (MAX_PAGE_SIZE=100, DEFAULT_PAGE_SIZE=20)
- Tests skip offset calculation for pagination
- Documents Cache-Control strategies per endpoint

## Pagination

### Bounded Pagination
- VERIFY:FD-PERF-003 — Pagination with clampPagination and Cache-Control
- clampPagination from @fleet-dispatch/shared enforces:
  - MAX_PAGE_SIZE = 100 (prevents unbounded queries)
  - DEFAULT_PAGE_SIZE = 20 (sensible default)
  - Minimum page = 1 (no negative offsets)
- skip = (page - 1) * pageSize
- Applied in: work-orders, technicians, customers, invoices, routes services

### Pagination Decorator
- VERIFY:FD-PERF-010 — @PaginationParams() decorator extracts page/pageSize from query string

### Cache Headers
- Work orders: `Cache-Control: no-store` (real-time dispatch data)
- Customers: `Cache-Control: private, max-age=30`
- Invoices: `Cache-Control: private, max-age=30`
- Routes: `Cache-Control: private, max-age=30`

## Database Optimization

### Indexes
- @@index([companyId]) on all tenant-scoped tables
- @@index([status]) on work_orders and invoices
- @@index([companyId, status]) composite indexes for filtered queries
- @@index([entityType, entityId]) on audit_logs for entity lookup
- @@index([userId]) on notifications for user inbox queries

### Query Patterns
- findMany with skip/take for pagination (never offset without limit)
- Promise.all for parallel count + data queries
- $transaction for atomic state machine transitions
- findUnique preferred over findFirst (with companyId verification)

## Performance Budget

| Metric | Target |
|--------|--------|
| p95 response time | < 200ms |
| List endpoint response | < 100ms (cached) |
| State transition | < 50ms (transaction) |
| Health check | < 10ms |

## Cross-References

- Metrics collection: see monitoring.md (FD-MON-007, FD-MON-008)
- Database schema indexes: see data-model.md (FD-DM-001)
- API pagination patterns: see api-layer.md (FD-API-*)
