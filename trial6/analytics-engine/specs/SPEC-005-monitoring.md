# SPEC-005: Monitoring

> **Status:** APPROVED
> **Priority:** P1
> **Cross-references:** SPEC-009 (API conventions)

## Overview

The Analytics Engine includes structured logging, health checks, metrics endpoints,
and request correlation. All monitoring endpoints are public (no authentication required).

## Requirements

### Health Check
<!-- VERIFY: monitoring-health -->
- GET /monitoring/health returns system health status
- Public endpoint (no authentication required)
- Checks database connectivity via `SELECT 1` query
- Returns { status: "healthy"|"degraded", version, timestamp, database: "connected"|"disconnected" }
- version comes from APP_VERSION constant in shared package

### Metrics
<!-- VERIFY: monitoring-metrics -->
- GET /monitoring/metrics returns runtime metrics
- Public endpoint (no authentication required)
- Returns { uptime, memoryUsage: { rss, heapUsed, heapTotal, external }, version, timestamp }
- Memory values are in bytes from process.memoryUsage()

### Structured Logging
<!-- VERIFY: monitoring-logging -->
- All request logging uses Pino (never console.log)
- Log entries follow LogEntry format from shared package
- formatLogEntry produces { level, message, timestamp, ...context }
- Sensitive fields are redacted via sanitizeLogContext before logging

### Correlation IDs
<!-- VERIFY: monitoring-correlation -->
- CorrelationIdMiddleware runs on all routes
- Preserves client-provided X-Correlation-ID header or generates UUID
- Stored in RequestContextService (request-scoped)
- Included in all log entries and error responses
- Returned in X-Correlation-ID response header (see SPEC-009)

### Response Time
<!-- VERIFY: monitoring-response-time -->
- ResponseTimeInterceptor measures request duration with performance.now()
- Sets X-Response-Time header on all responses (see SPEC-009)
- Applied globally via APP_INTERCEPTOR

## Verification Criteria

| VERIFY Tag | Assertion | Test Location |
|-----------|-----------|---------------|
| monitoring-health | Returns {status,version,timestamp,database}, healthy when DB up, degraded when down | test/monitoring.spec.ts, test/health.spec.ts |
| monitoring-metrics | Returns {uptime,memoryUsage,version,timestamp}, heapUsed <= heapTotal, uptime > 0 | test/monitoring.spec.ts, test/health.spec.ts |
| monitoring-logging | Pino logger used (no console.log), formatLogEntry produces structured entries | test/cross-layer.integration.spec.ts |
| monitoring-correlation | CorrelationIdMiddleware generates UUID or preserves client header, stored in RequestContextService | test/cross-layer.integration.spec.ts |
| monitoring-response-time | ResponseTimeInterceptor uses performance.now(), sets X-Response-Time header | test/performance.spec.ts |
