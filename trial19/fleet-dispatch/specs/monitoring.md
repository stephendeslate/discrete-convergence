# Monitoring Specification

## Overview

Fleet Dispatch provides comprehensive observability through health endpoints, structured logging, correlation ID propagation, and metrics collection. All monitoring endpoints are public (no auth required) and are NOT exempt from rate limiting.

## Health Check

GET /health returns status, timestamp, uptime (seconds), and version (APP_VERSION from shared). The endpoint is decorated with @Public() and does NOT use @SkipThrottle.

<!-- VERIFY: FD-MON-001 — Health endpoint returns status, timestamp, uptime, version -->

## Correlation ID Middleware

CorrelationIdMiddleware reads X-Correlation-ID from request headers or generates a new one using createCorrelationId() from shared (crypto.randomUUID). Sets the header on the response.

<!-- VERIFY: FD-MON-002 — Correlation ID middleware propagates or generates X-Correlation-ID -->

## Request Logging

RequestLoggingMiddleware uses pino for structured JSON logging. On response finish, logs method, URL, statusCode, duration, and correlationId using formatLogEntry from shared.

<!-- VERIFY: FD-MON-003 — Request logging middleware logs structured entries via pino -->

## Exception Logging

GlobalExceptionFilter catches all unhandled exceptions, logs them with pino at error level, sanitizes request body using sanitizeLogContext from shared, and returns correlationId in the error response.

<!-- VERIFY: FD-MON-004 — Global exception filter logs errors with sanitized context -->

## Metrics

GET /metrics returns requestCount, errorCount, avgResponseTime, and uptime. The endpoint is decorated with @Public().

<!-- VERIFY: FD-MON-005 — Metrics endpoint exposes request count, error count, and timing -->

## Readiness Check

GET /health/ready verifies database connectivity via $queryRaw`SELECT 1`. Returns connected/disconnected status.

<!-- VERIFY: FD-MON-006 — Readiness endpoint verifies database connectivity -->

## Log Duration Tracking

Request logging middleware calculates duration by comparing Date.now() at request start vs response finish event.

<!-- VERIFY: FD-MON-007 — Request logging tracks duration from start to finish -->

## Log Sanitization

GlobalExceptionFilter sanitizes request body before logging to prevent sensitive data (passwords, tokens, secrets) from appearing in logs.

<!-- VERIFY: FD-MON-008 — Exception filter sanitizes request body before logging -->
