# Monitoring Specification

## Overview

Observability and monitoring infrastructure for the Event Management platform.
Structured logging, correlation IDs, and health endpoints provide
production-grade operational visibility.

## Correlation IDs

- Every request receives a unique correlation ID
- If client sends X-Correlation-ID, it is preserved
- Otherwise, a new UUID is generated via createCorrelationId()
- Correlation ID propagated through request context and included in responses
- VERIFY: EM-MON-001 — createCorrelationId uses crypto.randomUUID()
- VERIFY: EM-MON-006 — CorrelationIdMiddleware sets X-Correlation-ID on request and response

## Structured Logging

- All log entries use LogEntry interface with timestamp, level, message, correlationId
- formatLogEntry() produces consistent JSON log format
- VERIFY: EM-MON-002 — LogEntry interface includes timestamp, level, message, correlationId
- VERIFY: EM-MON-003 — formatLogEntry returns structured JSON log entry

## Log Sanitization

- Sensitive fields (password, token, secret, authorization, cookie) are redacted
- Sanitization is recursive and handles nested objects
- Case-insensitive key matching for comprehensive redaction
- VERIFY: EM-MON-004 — sanitizeLogContext recursively redacts sensitive keys

## Error Handling

- GlobalExceptionFilter catches all unhandled exceptions
- HTTP exceptions preserve their status code
- Unknown exceptions return 500 Internal Server Error
- Correlation ID included in all error responses
- Stack traces logged but not sent to clients
- VERIFY: EM-MON-005 — GlobalExceptionFilter includes correlationId in error response

## Request Logging

- RequestLoggingMiddleware logs every incoming request
- Log entry includes method, URL, and correlation ID
- Uses formatLogEntry from shared package for consistency
- VERIFY: EM-MON-007 — RequestLoggingMiddleware logs using formatLogEntry

## Request Context

- RequestContextService is request-scoped
- Stores correlation ID and other per-request metadata
- VERIFY: EM-MON-008 — RequestContextService is Injectable with request scope

## Health Endpoints

- GET /health returns {status:'ok', version: APP_VERSION, timestamp}
- GET /health/ready checks database connectivity via $queryRaw
- Health endpoints are @Public() but NOT @SkipThrottle
- VERIFY: EM-MON-009 — Health controller is @Public without @SkipThrottle
