# Performance Specification

## Overview

The Analytics Engine implements performance optimizations including response time tracking, pagination with clamping, cache control headers, database indexing, and N+1 query prevention through Prisma includes.

See also: [api-endpoints.md](api-endpoints.md) for endpoint pagination, [data-model.md](data-model.md) for database indexes.

## Response Time Tracking

VERIFY: AE-PERF-001 — ResponseTimeInterceptor uses performance.now() from perf_hooks and sets X-Response-Time header

### ResponseTimeInterceptor
- Registered as APP_INTERCEPTOR in AppModule
- Uses performance.now() from perf_hooks for high-resolution timing
- Sets X-Response-Time header in format "{duration}ms"
- Applied to ALL responses (including error responses)

## Pagination

VERIFY: AE-PERF-002 — All list endpoints use parsePagination from shared with MAX_PAGE_SIZE clamping

### Configuration
- MAX_PAGE_SIZE: 100 (from shared constants)
- DEFAULT_PAGE_SIZE: 20 (from shared constants)
- Clamping behavior: pageSize > MAX_PAGE_SIZE is clamped to MAX_PAGE_SIZE (not rejected)
- Page minimum: 1 (negative or zero values default to 1)

### PaginatedQueryDto
- page: optional integer, minimum 1
- pageSize: optional integer, minimum 1, maximum MAX_PAGE_SIZE
- Uses class-transformer @Type(() => Number) for query string parsing

### Response Format
All list endpoints return: { data: T[], total: number, page: number, pageSize: number }

## Database Performance

VERIFY: AE-PERF-003 — Prisma queries use include for N+1 prevention on all findMany and findOne operations

### Indexes
- @@index on tenantId for all domain tables
- @@index on status for Dashboard
- @@index on composite (tenantId, status) for Dashboard
- @@index on dashboardId and dataSourceId for Widget

### N+1 Prevention
- All findMany queries include related entities (widgets, dashboard, dataSource)
- All findOne queries include related entities
- Prevents N+1 query patterns in list and detail views

### Connection Pooling
- DATABASE_URL includes connection_limit parameter
- Recommended: connection_limit=10 for development, adjust for production

## Frontend Performance

### Code Splitting
- next/dynamic for lazy loading heavy components
- Skeleton loading states during data fetching
- Server components for data fetching (no client-side waterfall)

### Bundle Optimization
- Server actions reduce client-side JavaScript
- shadcn/ui components are individually imported (no full library bundle)
- Tailwind CSS purges unused styles in production

## Monitoring Integration

- ResponseTimeInterceptor measures actual handler duration
- RequestLoggingMiddleware captures total request duration
- Metrics endpoint tracks average response time across all requests
