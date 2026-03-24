# Monitoring Specification

## Overview

FleetDispatch implements structured logging, correlation IDs, response time
tracking, health checks, and metrics collection.

## Global Exception Filter

- VERIFY:FD-MON-001 — GlobalExceptionFilter catches all unhandled exceptions
- VERIFY:FD-MON-002 — Filter logs error with correlation ID and sanitized context
- VERIFY:FD-FILTER-001 — Filter registered as APP_FILTER in AppModule
- Returns standardized error response with statusCode, message, correlationId

## Correlation IDs

- VERIFY:FD-MON-003 — CorrelationIdMiddleware generates UUID for each request
- VERIFY:FD-CORR-001 — createCorrelationId uses 'fd-' prefix from shared
- Correlation ID passed via x-correlation-id header
- Available throughout request lifecycle via RequestContextService

## Request Logging

- VERIFY:FD-MON-004 — RequestLoggingMiddleware logs method, url, statusCode, duration
- VERIFY:FD-MON-005 — RequestContextService stores correlation ID per request
- Logs include correlation ID for distributed tracing

## Structured Logger

- VERIFY:FD-MON-006 — LoggerService wraps NestJS Logger with structured output
- VERIFY:FD-LOG-001 — formatLogEntry from shared formats consistent log entries
- VERIFY:FD-SAN-001 — sanitizeLogContext strips sensitive fields before logging
- VERIFY:FD-SAN-002 — Sanitizer handles nested objects and arrays recursively

## Response Time

- VERIFY:FD-PERF-001 — ResponseTimeInterceptor measures request duration
- VERIFY:FD-PERF-002 — Adds X-Response-Time header to responses
- Registered as APP_INTERCEPTOR in AppModule

## Health & Metrics

- VERIFY:FD-MON-007 — MonitoringService provides system health information
- VERIFY:FD-MON-008 — Health endpoint returns database connectivity status
- VERIFY:FD-MON-009 — Readiness endpoint checks all dependencies
- VERIFY:FD-MON-010 — MetricsService tracks request counts, error rates, latency
- VERIFY:FD-MON-011 — MonitoringController exposes /health, /ready, /metrics
- VERIFY:FD-FE-001 — Health endpoint is @Public (no auth required)

## Integration Tests

- VERIFY:FD-TEST-003 — Monitoring integration test covers health, correlation IDs
- VERIFY:FD-TEST-004 — Tests verify structured log output format

## Cross-References

- See [Security](./security.md) for log sanitization rules
- See [Authentication](./authentication.md) for auth failure logging
- See [API Endpoints](./api-endpoints.md) for response time headers
- See [Infrastructure](./infrastructure.md) for Docker health checks
