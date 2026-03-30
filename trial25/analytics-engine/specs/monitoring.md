# Monitoring Specification

## Overview

The Analytics Engine provides health checks, metrics, and structured logging
for production observability and container orchestration.

## Health Endpoints

### GET /health
- Returns 200 with { status: 'ok' }
- No authentication required
- Used as primary liveness probe
- Must respond under 500ms

### GET /health/ready
- Returns 200 when application and database are ready
- Includes database connectivity check (try/catch with branching)
- Returns 503 if database is unavailable
- Used as readiness probe for container orchestration

### GET /health/metrics
- Returns system metrics including:
  - memory: process.memoryUsage()
  - uptime: process.uptime()
  - nodeVersion: process.version
- No authentication required

### GET /metrics
- Alias endpoint that redirects/proxies to /health/metrics
- Provided via MetricsAliasController

<!-- VERIFY:MON-HEALTH-PATH — Health check at /health (not /monitoring/health) -->
<!-- VERIFY:MON-READY-ENDPOINT — /health/ready includes database check -->
<!-- VERIFY:MON-METRICS — /health/metrics returns memory and uptime -->

## Correlation IDs

- CorrelationInterceptor runs on every request
- Generates UUID v4 via createCorrelationId() from @repo/shared
- Sets x-correlation-id response header
- Included in error responses via GlobalExceptionFilter

<!-- VERIFY:MON-CORRELATION-ID — Correlation ID in response headers -->

## Response Time Tracking

- ResponseTimeInterceptor measures request duration
- Sets x-response-time header with milliseconds
- Runs on every request

<!-- VERIFY:MON-RESPONSE-TIME — x-response-time header on all responses -->

## Structured Logging

- nestjs-pino for structured JSON logging
- Log context sanitization via sanitizeLogContext from @repo/shared
- Sensitive fields stripped: password, token, secret, authorization, cookie
- Request/response logging with correlation IDs

## Error Tracking

- GlobalExceptionFilter catches all unhandled exceptions
- Structured error response with correlationId
- Different detail levels based on NODE_ENV
- HttpException status codes preserved
- Unknown errors return 500

## Graceful Shutdown

- app.enableShutdownHooks() in main.ts
- PrismaService handles disconnect on shutdown
- Allows in-flight requests to complete

<!-- VERIFY:MON-SHUTDOWN — enableShutdownHooks called in main.ts -->

## Container Health Check

Docker HEALTHCHECK instruction:
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1
```

## Monitoring Module

- MonitoringController mounted at /health
- MetricsAliasController mounted at /metrics
- No authentication guards on monitoring endpoints
- MonitoringModule imported by AppModule

## Implementation Traceability

<!-- VERIFY:AE-MON-001 — Health/ready/metrics endpoints at /health -->
<!-- VERIFY:AE-MON-002 — Health endpoint returns status ok -->
<!-- VERIFY:AE-MON-003 — Readiness endpoint with DB check branching -->
<!-- VERIFY:AE-MON-004 — Metrics endpoint with uptime and memory -->
<!-- VERIFY:AE-MON-005 — Metrics alias at /metrics -->
<!-- VERIFY:AE-MON-MOD-001 — MonitoringModule definition -->
<!-- VERIFY:AE-CORR-001 — CorrelationInterceptor generates UUID -->
<!-- VERIFY:AE-CORR-003 — Correlation ID in error responses -->
<!-- VERIFY:MON-CTRL — Monitoring controller implementation -->
<!-- VERIFY:MON-CTRL-TEST — Monitoring controller unit tests -->
<!-- VERIFY:MON-MOD — Monitoring module definition -->
<!-- VERIFY:CORR-INT — Correlation interceptor implementation -->
<!-- VERIFY:CORR-INT-TEST — Correlation interceptor tests -->
<!-- VERIFY:RESP-TIME — Response time interceptor -->
<!-- VERIFY:RESP-TIME-TEST — Response time interceptor tests -->
<!-- VERIFY:PERF-CONCURRENT — Performance: concurrent request handling -->
<!-- VERIFY:PERF-HEALTH-LATENCY — Performance: health endpoint latency -->
<!-- VERIFY:PERF-METRICS — Performance: metrics endpoint -->
<!-- VERIFY:PERF-RESPONSE-TIME — Performance: response time measurement -->
<!-- VERIFY:PERF-SUITE — Performance test suite -->
<!-- VERIFY:AE-TEST-001 — Test environment configuration -->
<!-- VERIFY:AE-TEST-002 — Test mock setup -->
<!-- VERIFY:AE-TEST-003 — Test utility helpers -->
