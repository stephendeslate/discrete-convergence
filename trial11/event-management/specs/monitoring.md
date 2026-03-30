# Monitoring Specification

## Overview

The event-management system implements comprehensive observability through
correlation IDs, structured logging, log sanitization, response time
tracking, and health/readiness/metrics endpoints.

## Requirements

### MON-001: Correlation IDs

- VERIFY: EM-MON-001 — createCorrelationId() in the shared package generates
  unique identifiers for request tracing using crypto.randomUUID().

### MON-002: Log Formatting

- VERIFY: EM-MON-002 — formatLogEntry() in the shared package creates
  structured log entries with timestamp, level, message, and context fields
  in a consistent JSON-compatible format.

### MON-003: Log Levels

- VERIFY: EM-MON-003 — formatLogEntry() supports standard log levels
  (info, warn, error, debug) for filtering and alerting configuration.

### MON-004: Log Sanitization

- VERIFY: EM-MON-004 — sanitizeLogContext() in the shared package
  recursively processes objects to redact sensitive fields (password, token,
  secret, authorization, cookie) with case-insensitive key matching.

### MON-005: Deep Sanitization

- VERIFY: EM-MON-005 — sanitizeLogContext() handles deeply nested objects
  and arrays, recursively sanitizing all levels to prevent sensitive data
  leakage in complex log payloads.

### MON-006: Global Exception Filter

- VERIFY: EM-MON-006 — GlobalExceptionFilter catches all unhandled
  exceptions, sanitizes the error context using sanitizeLogContext from
  shared, and returns structured error responses with correlation IDs.

### MON-007: Correlation ID Middleware

- VERIFY: EM-MON-007 — CorrelationIdMiddleware attaches a unique correlation
  ID to each incoming request using createCorrelationId from the shared
  package. The ID is propagated via request headers.

### MON-008: Request Logging Middleware

- VERIFY: EM-MON-008 — RequestLoggingMiddleware logs incoming requests and
  outgoing responses using formatLogEntry from the shared package, including
  method, URL, status code, and response time.

### MON-009: Monitoring Controller

- VERIFY: EM-MON-009 — MonitoringController exposes /health, /readiness,
  and /metrics endpoints. ALL methods are decorated with @Public() to
  ensure accessibility without authentication.

### MON-010: Monitoring Service

- VERIFY: EM-MON-010 — MonitoringService implements health() returning
  status and uptime, readiness() testing database connectivity via
  $queryRaw, and metrics() returning system performance data.

### MON-011: Monitoring Test Suite

- VERIFY: EM-MON-011 — Monitoring integration tests verify all three
  endpoints return correct response structures, health includes uptime,
  readiness succeeds with database connection, and metrics include
  memory/cpu data.

## Performance

### PERF-001: MAX_PAGE_SIZE

- VERIFY: EM-PERF-001 — MAX_PAGE_SIZE constant (100) is exported from
  shared to prevent unbounded query results across all list endpoints.

### PERF-002: DEFAULT_PAGE_SIZE

- VERIFY: EM-PERF-002 — DEFAULT_PAGE_SIZE constant (20) provides a
  sensible default when page size is not specified by the client.

### PERF-003: Pagination Clamping

- VERIFY: EM-PERF-003 — clampPagination() ensures page >= 1 and
  pageSize is clamped between 1 and MAX_PAGE_SIZE to prevent abuse.

### PERF-004: Paginated Results

- VERIFY: EM-PERF-004 — paginatedResult() constructs standardized
  pagination response objects with data, total, page, and pageSize fields.

### PERF-005: Response Time Interceptor

- VERIFY: EM-PERF-005 — ResponseTimeInterceptor uses performance.now()
  to measure request duration and adds an X-Response-Time header to
  every response for client-side performance monitoring.

### PERF-006: Performance Test Suite

- VERIFY: EM-PERF-006 — Performance integration tests verify response
  time headers are present, pagination clamping works correctly at
  boundaries, and API responses complete within acceptable thresholds.

## Alerting Strategy

- Health endpoint failures trigger container restart via Docker HEALTHCHECK.
- Response times exceeding thresholds are visible in X-Response-Time headers.
- Structured logs enable log aggregation and pattern-based alerting.
- Correlation IDs enable end-to-end request tracing across services.
