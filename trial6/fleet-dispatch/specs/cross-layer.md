# FD-SPEC-008: Cross-Layer Integration

## Overview
This spec describes end-to-end flows crossing frontend, API, and database layers.

## Login Flow
1. User submits credentials on /login page
2. Server action calls POST /auth/login
3. API validates credentials, returns JWT
4. Server action stores token in cookie
5. Middleware allows access to protected pages

## Delivery Creation Flow
1. Dispatcher fills form on /deliveries page
2. Server action calls POST /deliveries with JWT header
3. API validates DTO, extracts tenantId from JWT
4. DeliveryService creates record with Decimal cost
5. Response includes delivery with relations
6. Frontend displays new delivery in list

## Tenant Isolation Flow
1. Request arrives with JWT containing tenantId
2. @TenantId() decorator extracts tenantId
3. Service layer queries with `where: { tenantId }`
4. findUnique results verified against tenantId
5. Cross-tenant data never returned

## Error Propagation
1. Service throws NotFoundException / ConflictException
2. GlobalExceptionFilter catches exception
3. Correlation ID attached to error response
4. MetricsService records error count
5. Frontend displays error message from response

## Pagination Flow
1. Frontend sends ?page=N&pageSize=N
2. Controller passes to service
3. Service calls clampPagination (shared utility)
4. Prisma skip/take applied
5. Response includes data + meta (total, page, pageSize, totalPages)

<!-- VERIFY:FD-PERF-001 — clampPagination never rejects, always clamps -->

## Correlation ID Propagation
1. Client optionally sends X-Correlation-Id header
2. CorrelationIdMiddleware preserves or generates UUID
3. ID available in request headers throughout lifecycle
4. Error responses include correlationId field
5. All log entries tagged with correlationId

<!-- VERIFY:FD-MON-009 — correlation ID middleware -->
<!-- VERIFY:FD-MON-008 — exception filter includes correlationId in response -->

## Monitoring Integration
1. Every request passes through ResponseTimeInterceptor
2. Duration recorded in MetricsService
3. X-Response-Time header set on response
4. /monitoring/metrics exposes aggregated stats
5. /monitoring/health provides liveness check

<!-- VERIFY:FD-PERF-002 — response time interceptor records metrics -->
<!-- VERIFY:FD-MON-007 — metrics service aggregates request/error counts -->
