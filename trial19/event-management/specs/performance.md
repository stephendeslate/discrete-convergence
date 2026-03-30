# Performance Specification

## Overview

Performance requirements and optimizations for the Event Management platform.
Covers pagination, caching, response timing, and load handling.

## Pagination

- All list endpoints support page and limit query parameters
- Default page size is DEFAULT_PAGE_SIZE (20)
- Maximum page size is MAX_PAGE_SIZE (100)
- Values exceeding maximum are clamped to MAX_PAGE_SIZE
- VERIFY: EM-PERF-003 — clampPagination enforces MAX_PAGE_SIZE upper bound
- VERIFY: EM-PERF-004 — clampPagination defaults to DEFAULT_PAGE_SIZE when not specified

## Response Timing

- X-Response-Time header added to all responses
- Measured via NestJS interceptor using Date.now() before and after handler
- Value expressed in milliseconds (e.g., "12ms")
- VERIFY: EM-PERF-005 — ResponseTimeInterceptor sets X-Response-Time header

## Caching

- Event list endpoint sets Cache-Control header (max-age=60)
- Individual resource endpoints do not cache (stale-while-revalidate strategy)
- Cache headers set at controller level, not middleware

## Rate Limiting (Throttle)

- ThrottlerModule configured with three named tiers:
  - short: 100 requests per 1 second (general)
  - medium: 500 requests per 10 seconds
  - long: 2000 requests per 60 seconds
- Auth endpoints override with 3 requests per 1 second
- Health endpoints use default global limits (no @SkipThrottle)

## Database Performance

- Composite indexes on (tenantId, status) for events
- Composite indexes on (tenantId, eventId) for registrations
- Single-column indexes on tenantId for all domain tables
- Prisma query engine handles connection pooling

## Load Testing

- autocannon available as devDependency for load testing
- Performance tests verify response times under 500ms
- Rapid request tests confirm rate limiter stability
