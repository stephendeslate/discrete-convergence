# Monitoring Specification

## VERIFY:EM-MON-001 — Correlation ID Generation
createCorrelationId() generates UUID v4 for request tracing.

## VERIFY:EM-MON-002 — Structured Log Format
formatLogEntry() creates JSON-structured log entries with timestamp, level, message.

## VERIFY:EM-MON-003 — Log Sanitization
sanitizeLogContext() redacts sensitive fields (password, token, secret, authorization).

## VERIFY:EM-MON-004 — Recursive Sanitization
sanitizeLogContext handles nested objects and arrays recursively.

## VERIFY:EM-MON-005 — Health Endpoints
MonitoringController exposes /monitoring/health and /monitoring/ready, both @Public().

## VERIFY:EM-MON-006 — Correlation ID Middleware
CorrelationIdMiddleware preserves x-correlation-id header or generates new one.
Stores in RequestContextService for downstream use.

## VERIFY:EM-MON-007 — Request Context
RequestContextService (REQUEST scoped) stores correlationId, userId, tenantId per request.

## VERIFY:EM-MON-008 — Request Logging
RequestLoggingMiddleware logs method, URL, status code, duration, and correlationId
using Pino structured logger.

## VERIFY:EM-MON-009 — Health Service
MonitoringService returns health (status, version, uptime) and readiness (database connectivity).

## Logging Rules

- All logging via Pino (never console.log)
- Structured JSON format
- Correlation IDs on all requests
- Sensitive fields redacted in logs
