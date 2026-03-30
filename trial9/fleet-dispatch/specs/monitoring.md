# Monitoring Specification

## Overview

Fleet Dispatch implements comprehensive observability through structured
JSON logging with Pino, correlation ID propagation, request/response
logging, health checks, metrics collection, and a global exception filter.

## Correlation IDs

<!-- VERIFY: FD-MON-001 -->
The `createCorrelationId()` function from the shared package generates
unique identifiers using `crypto.randomUUID()` for request tracing.

<!-- VERIFY: FD-MON-007 -->
The CorrelationIdMiddleware extracts the `x-correlation-id` header
from incoming requests or generates a new one. It sets the correlation
ID on both the request object and the response header.

## Structured Logging

<!-- VERIFY: FD-MON-002 -->
The `formatLogEntry()` function from the shared package creates
structured JSON log entries with timestamp, level, message, correlationId,
and additional context fields.

<!-- VERIFY: FD-MON-003 -->
The `sanitizeLogContext()` function from the shared package redacts
sensitive fields from log context objects. It handles:
- Top-level sensitive keys (password, passwordHash, token, secret)
- Case-insensitive matching (Authorization, authorization, AUTHORIZATION)
- Nested objects (recursively sanitizes deep structures)
- Arrays (sanitizes each element)

## Logger Service

<!-- VERIFY: FD-MON-005 -->
PinoLoggerService wraps the Pino logger with NestJS LoggerService
interface. It provides info, error, warn, debug, and verbose methods
that output structured JSON to stdout.

## Request Context

<!-- VERIFY: FD-MON-006 -->
RequestContextService is a request-scoped provider that stores
correlation ID and request metadata for the duration of each request.

## Request Logging

<!-- VERIFY: FD-MON-008 -->
RequestLoggingMiddleware logs incoming requests and outgoing responses
with method, URL, status code, response time, and correlation ID.

## Exception Filter

<!-- VERIFY: FD-MON-004 -->
GlobalExceptionFilter catches all unhandled exceptions and returns
sanitized error responses. It:
- Maps HttpException to appropriate status codes
- Returns generic "Internal Server Error" for non-HTTP exceptions
- Includes correlationId in error responses for debugging
- Never exposes stack traces or internal error details
- Logs full error details server-side with sanitized context

## Metrics

<!-- VERIFY: FD-MON-009 -->
MetricsService tracks application metrics including request counts,
error counts, and response time distributions.

## Health Endpoints

<!-- VERIFY: FD-MON-010 -->
The HealthController exposes basic health check at `GET /health`
returning `{ status: 'ok', timestamp, version }` using APP_VERSION.

<!-- VERIFY: FD-MON-011 -->
The metrics endpoint at `GET /metrics` returns collected application
metrics for monitoring dashboards.

## Integration Testing

<!-- VERIFY: FD-MON-012 -->
Monitoring integration tests verify:
- Health endpoint returns 200 with status ok
- Ready endpoint checks database connectivity
- Metrics endpoint returns collected data
- Correlation IDs propagate through request pipeline
- Error responses include correlation IDs
