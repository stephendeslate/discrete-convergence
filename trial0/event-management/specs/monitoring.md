# Monitoring Specification

## Overview
Structured JSON logging with correlation IDs, request/response metrics,
health checks, and centralized error handling.

## Exception Handling
- VERIFY:EM-MON-001 — GlobalExceptionFilter catches all errors, returns structured JSON
- VERIFY:EM-MON-002 — Filter logs with correlation ID, HTTP status, sanitized context

## Request Tracking
- VERIFY:EM-MON-003 — CorrelationIdMiddleware generates/propagates X-Correlation-ID header
- VERIFY:EM-MON-004 — RequestLoggingMiddleware logs method, url, status, duration
- VERIFY:EM-MON-005 — RequestContextService stores per-request state (AsyncLocalStorage pattern)

## Structured Logging
- VERIFY:EM-MON-006 — LoggerService wraps NestJS Logger with structured format
- VERIFY:EM-LOG-001 — formatLogEntry from shared creates { timestamp, level, message, correlationId }
- VERIFY:EM-CORR-001 — createCorrelationId generates UUID v4 prefixed IDs
- VERIFY:EM-SAN-001 — sanitizeLogContext strips sensitive fields before logging
- VERIFY:EM-SAN-002 — Sanitizer handles deep nesting, arrays, case-insensitive keys

## Performance
- VERIFY:EM-PERF-001 — ResponseTimeInterceptor registered via APP_INTERCEPTOR
- VERIFY:EM-PERF-002 — Interceptor adds X-Response-Time header to all responses

## Metrics
- VERIFY:EM-MON-007 — MonitoringService tracks request count, error count, response times
- VERIFY:EM-MON-008 — Health endpoint returns uptime, memory usage, DB connectivity
- VERIFY:EM-MON-009 — Metrics endpoint returns aggregated performance data
- VERIFY:EM-MON-010 — MetricsService maintains in-memory counters and percentile data

## Health Check
- VERIFY:EM-MON-011 — GET /monitoring/health returns { status, uptime, memory, db }
- VERIFY:EM-FE-001 — Frontend can fetch health status for status display
- Cross-reference: [api-endpoints.md](./api-endpoints.md) — Monitoring controller routes
- Cross-reference: [security.md](./security.md) — Exception filter integration
- Cross-reference: [infrastructure.md](./infrastructure.md) — Docker HEALTHCHECK uses this endpoint

## Filter Registration
- VERIFY:EM-FILTER-001 — APP_FILTER provides GlobalExceptionFilter in AppModule

## Log Format
- All log entries follow structured JSON format: { timestamp, level, message, correlationId, context }
- Log levels: error, warn, log, debug — mapped to standard severity for log aggregation
- Context object contains request metadata (method, url, userId, tenantId) after sanitization
- Cross-reference: [security.md](./security.md) — Sensitive fields stripped before logging
- VERIFY:EM-MON-012 — No console.log calls in api/src; all logging via LoggerService

## Alerting Thresholds
- Error rate tracked via MonitoringService error counter per time window
- Response time percentiles (p50, p95, p99) available from MetricsService
- Health endpoint returns degraded status when database connectivity fails
- Memory usage reported in health response for container orchestration decisions
- Cross-reference: [infrastructure.md](./infrastructure.md) — Docker HEALTHCHECK polls /monitoring/health

## Test Coverage
- VERIFY:EM-TEST-004 — Monitoring integration test: health, metrics endpoints
- VERIFY:EM-TEST-003 — Cross-layer test verifies correlation ID propagation
