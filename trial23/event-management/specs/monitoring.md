# Monitoring Specification

> **Project:** Event Management
> **Domain:** MON
> **VERIFY Tags:** EM-MON-001 – EM-MON-004

---

## Overview

Structured logging with Pino for production JSON output and pino-pretty for
development readability. Correlation IDs trace requests through the full
lifecycle. Health endpoints provide system status. Global exception filter
sanitizes error contexts before logging.

---

## Requirements

### EM-MON-001: Pino JSON Logging

<!-- VERIFY: EM-MON-001 -->

- Pino configured via `nestjs-pino` LoggerModule.
- JSON format in production for structured log aggregation.
- `pino-pretty` transport enabled only when `NODE_ENV === 'development'`.
- Conditional check uses strict equality, not `!== 'production'`.
- All application logging goes through NestJS Logger (no `console.log`).

### EM-MON-002: Correlation ID Middleware

<!-- VERIFY: EM-MON-002 -->

- `CorrelationIdMiddleware` reads `X-Correlation-ID` from request headers.
- If no header present, generates a new UUID via `createCorrelationId()`.
- Sets the correlation ID on both the request and response headers.
- Enables distributed tracing across service boundaries.

### EM-MON-003: Health Endpoint Response

<!-- VERIFY: EM-MON-003 -->

- GET /health returns `{ status: 'ok', timestamp, uptime, version }`.
- `version` comes from `APP_VERSION` in `@repo/shared`.
- Endpoint is decorated with `@Public()` (no authentication required).
- Health endpoint is NOT decorated with `@SkipThrottle()` — rate limiting
  headers appear on health check responses.
- GET /health/ready provides readiness check.

### EM-MON-004: Global Exception Filter

<!-- VERIFY: EM-MON-004 -->

- `GlobalExceptionFilter` registered as `APP_FILTER` in AppModule.
- Catches all unhandled exceptions.
- Sanitizes log context via `sanitizeLogContext()` from `@repo/shared`.
- Returns structured error response with statusCode, message, timestamp, path.
- HttpExceptions preserve their original status code.
- Unknown exceptions map to 500 Internal Server Error.
