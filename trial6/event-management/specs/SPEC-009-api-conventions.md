# SPEC-009: API Conventions

**Status:** APPROVED
**Priority:** P1
**Cross-References:** SPEC-001 (Authentication), SPEC-008 (Security)

## Overview

API design conventions for pagination, error responses, correlation IDs,
structured logging, and request/response patterns.

## Requirements

### VERIFY:EM-PERF-001 — Pagination Clamping
Pagination uses shared clampPagination utility. Page size clamped to [1, 100],
defaults to 20. Page number clamped to minimum 1. Values are clamped, not rejected.

### VERIFY:EM-PERF-002 — Response Time Header
ResponseTimeInterceptor measures request duration and sets X-Response-Time header.

### VERIFY:EM-PERF-003 — Paginated Response Format
All list endpoints return PaginatedResult: { data: T[], meta: { total, page, pageSize, totalPages } }.

### VERIFY:EM-MON-001 — Correlation ID Generation
createCorrelationId() generates UUID v4 for request tracing.

### VERIFY:EM-MON-006 — Correlation ID Middleware
CorrelationIdMiddleware preserves X-Correlation-ID from request header or generates new one.
Stored in RequestContextService for access throughout request lifecycle.

### VERIFY:EM-MON-008 — Request Logging
RequestLoggingMiddleware logs method, URL, status code, duration, and correlationId
using Pino structured JSON format.

## Verification Criteria

1. Pagination clamping prevents page sizes > 100 and < 1
2. X-Response-Time header present on all responses
3. PaginatedResult format includes data array and meta object
4. X-Correlation-ID preserved from request or generated as UUID v4
5. Structured JSON logging includes method, URL, status, duration, correlationId
6. Error responses include correlationId for traceability

## Error Response Format

```json
{
  "statusCode": 404,
  "message": "Event abc123 not found",
  "correlationId": "uuid-v4",
  "timestamp": "2026-03-24T12:00:00.000Z"
}
```

## Request Headers

- Authorization: Bearer {jwt} — required for protected endpoints
- X-Correlation-ID: uuid — optional, generated if not provided
- Content-Type: application/json — for POST/PATCH bodies

## Response Headers

- X-Response-Time: {ms} — request processing duration
- X-Correlation-ID: uuid — echoed back for tracing
