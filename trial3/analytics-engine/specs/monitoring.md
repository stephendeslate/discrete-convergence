# Monitoring Specification

## Overview

The Analytics Engine uses Pino for structured JSON logging, correlation ID
tracking for distributed tracing, health/readiness endpoints, and in-memory
metrics collection.

## Pino Logger

The PinoLoggerService is a DI-injectable NestJS service wrapping the Pino logger.
It produces structured JSON logs with ISO timestamps and level labels.
No console.log calls are used in production code.

- VERIFY:AE-MON-001 — PinoLoggerService is DI-injectable with structured
  JSON logging via Pino

## Request Context

The RequestContextService is request-scoped and stores correlation ID,
user ID, and tenant ID for the current request lifecycle.

- VERIFY:AE-MON-002 — RequestContextService is request-scoped with
  correlationId, userId, tenantId fields

## Global Exception Filter

The GlobalExceptionFilter is registered as APP_FILTER in AppModule.
It sanitizes error responses (no stack traces), includes the correlation ID
in the response body, and logs sanitized request bodies.

- VERIFY:AE-MON-003 — GlobalExceptionFilter includes correlationId in
  response body and sanitizes error output

## Correlation ID Middleware

The CorrelationIdMiddleware preserves client-provided X-Correlation-ID headers
or generates a new UUID via createCorrelationId from the shared package.
The correlation ID is attached to both the request and response.

- VERIFY:AE-MON-004 — CorrelationIdMiddleware preserves client ID or
  generates UUID via createCorrelationId from shared

## Request Logging Middleware

The RequestLoggingMiddleware logs HTTP method, URL, status code, duration,
and correlation ID for every request using formatLogEntry from shared.

- VERIFY:AE-MON-005 — RequestLoggingMiddleware logs method, URL, status,
  duration, correlationId using formatLogEntry from shared

## Health Endpoints

Health endpoints are exempt from authentication (@Public()) and rate limiting
(@SkipThrottle()). They provide system status information.

### GET /health
Returns: status, timestamp, uptime, version (from APP_VERSION shared constant)

### GET /health/ready
Performs $queryRaw database connectivity check.
Returns database connection status.

### GET /metrics
Returns in-memory request/error counts, average response time, and uptime.

- VERIFY:AE-MON-006 — Health, ready, and metrics endpoints are public
  and skip rate limiting

## Log Sanitization

The sanitizeLogContext function from the shared package redacts sensitive
fields (password, token, secret, authorization, etc.) from log entries.
It handles nested objects and arrays recursively.

## Frontend Error Boundary

The frontend reports client-side errors via POST /errors for server-side
collection and monitoring.
