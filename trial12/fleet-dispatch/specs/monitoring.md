# Monitoring Specification

## Overview

Fleet Dispatch provides comprehensive monitoring through health checks,
metrics collection, request logging, and response time tracking. All
monitoring endpoints are public (no authentication required) and exempt
from rate limiting per v1.2-dc FM-27 requirements.

## Requirements

### Health Check

- VERIFY: FD-MON-001
  GET /health returns { status: 'ok', timestamp, uptime, version }.
  Version is read from APP_VERSION in shared package.
  Endpoint is decorated with @Public() and @SkipThrottle().

- VERIFY: FD-MON-002
  Health check verifies database connectivity via Prisma $queryRaw.
  Database failure returns degraded status with error details.

### Metrics Endpoint

- VERIFY: FD-MON-003
  GET /metrics returns request count, error count, average response time,
  and uptime statistics. Data is collected by MonitoringService.

- VERIFY: FD-MON-004
  Metrics endpoint is decorated with @Public() and @SkipThrottle().
  No authentication required for metrics access.

### Request Logging

- VERIFY: FD-MON-005
  Request logging middleware captures method, url, status code, duration.
  Log entries use formatLogEntry from shared package.

- VERIFY: FD-MON-006
  Log context is sanitized via sanitizeLogContext to redact sensitive fields
  (password, token, secret, authorization, accessToken, access_token, passwordHash).

### Correlation ID

- VERIFY: FD-MON-007
  Correlation ID middleware reads X-Correlation-ID header or generates one
  via createCorrelationId from shared package.

- VERIFY: FD-MON-008
  Correlation ID is attached to request context and included in all log entries
  and error responses for distributed tracing support.

### Response Time Tracking

- VERIFY: FD-MON-009
  ResponseTimeInterceptor (APP_INTERCEPTOR) measures request processing time.
  Timing data is recorded in MonitoringService for metrics aggregation.

- VERIFY: FD-MON-010
  Response time is included in response headers (X-Response-Time).
  Slow requests (>1000ms) are logged as warnings.

### Performance Monitoring

- VERIFY: FD-MON-011
  Performance tests verify response times are within acceptable thresholds.
  Health endpoint must respond within configured timeout.
  Concurrent request handling is tested for stability.

### Performance Test Coverage

- VERIFY: FD-PERF-001
  Health endpoint response time is tested to be under threshold.

- VERIFY: FD-PERF-002
  Metrics endpoint returns valid monitoring data structure.

- VERIFY: FD-PERF-003
  Concurrent requests to health endpoint are handled without errors.

- VERIFY: FD-PERF-004
  Response time headers are present on API responses.

- VERIFY: FD-PERF-005
  Monitoring service tracks request counts accurately.

- VERIFY: FD-PERF-006
  Error count tracking increments on failed requests.

- VERIFY: FD-PERF-007
  Average response time calculation produces valid numeric results.

## Cross-References

- See [security.md](security.md) for public decorator and throttle skip configuration
- See [infrastructure.md](infrastructure.md) for health check in Docker and CI
- See [api-endpoints.md](api-endpoints.md) for endpoint route definitions
