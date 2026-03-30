# Monitoring Specification

## Overview

Fleet Dispatch implements comprehensive monitoring with structured JSON logging
via Pino, correlation ID propagation, health checks, metrics collection, and
a global exception filter for sanitized error responses.

## Structured Logging

- VERIFY: FD-MON-001 — APP_VERSION exported from shared constants
- VERIFY: FD-MON-002 — createCorrelationId generates UUID for request tracing
- VERIFY: FD-MON-003 — LogEntry interface with structured fields
- VERIFY: FD-MON-004 — formatLogEntry creates consistent log structures

## Correlation ID Middleware

- VERIFY: FD-MON-005 — CorrelationIdMiddleware preserves or generates X-Correlation-ID
- Preserves client-provided X-Correlation-ID header
- Generates new UUID via createCorrelationId from shared if not provided
- Sets correlation ID on request and response headers

## Request Logging

- VERIFY: FD-MON-006 — RequestLoggingMiddleware logs method, URL, status, duration
- Uses formatLogEntry from shared for consistent formatting
- Includes correlationId in every log entry

## Request Context

- VERIFY: FD-MON-007 — RequestContextService (request-scoped) stores correlationId, userId, tenantId

## Health Endpoints

- VERIFY: FD-MON-008 — GET /health returns status, timestamp, uptime, version
- VERIFY: FD-MON-009 — GET /health/ready performs $queryRaw DB connectivity check
- VERIFY: FD-MON-010 — Health endpoints exempt from auth (@Public()) and rate limiting (@SkipThrottle())

## Metrics Endpoint

- VERIFY: FD-MON-011 — GET /metrics returns request/error counts, avg response time, uptime

## Global Exception Filter

- VERIFY: FD-MON-012 — GlobalExceptionFilter as APP_FILTER in AppModule
- Sanitizes error responses (no stack traces in production)
- Includes correlationId in error response body
- Uses sanitizeLogContext from shared to redact sensitive fields

## Monitoring Controller

The monitoring controller exposes health and metrics endpoints.
All methods are marked @Public() since they provide system-wide information
that is not tenant-specific.

## Pino Logger

- DI-injectable PinoLogger service
- Never uses console.log in API source code
- Structured JSON output for log aggregation

## Frontend Error Boundary

- POST /errors endpoint for frontend error reporting
- Error boundary component catches React rendering errors
