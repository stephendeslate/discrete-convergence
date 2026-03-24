# Monitoring Specification

> **Project:** Analytics Engine
> **Category:** MON
> **Related:** See [cross-layer.md](cross-layer.md) for global provider registration, see [security.md](security.md) for log sanitization context

---

## Overview

The analytics engine implements structured observability with Pino JSON logging, correlation ID propagation, request context tracking, health endpoints, application metrics, and a global exception filter. All monitoring components use NestJS dependency injection and import utilities from the shared package.

---

## Requirements

### VERIFY:AE-MON-001 — Pino structured JSON logging

The application uses Pino as its logger, configured for structured JSON output. The logger is injectable via NestJS DI — `console.log` is never used in `apps/api/src/`. Log entries are formatted using `formatLogEntry` from the shared package to ensure consistent structure across all log statements.

### VERIFY:AE-MON-002 — Correlation ID middleware

`CorrelationIdMiddleware` preserves the client-provided `X-Correlation-ID` header or generates a new UUID using `createCorrelationId` from the shared package. The correlation ID is attached to the request context and included in all log entries and response headers for distributed tracing.

### VERIFY:AE-MON-003 — Health and readiness endpoints

`GET /health` returns status, timestamp, uptime, and version (from `APP_VERSION` shared constant). `GET /health/ready` performs a `$queryRaw` database connectivity check. Both endpoints are decorated with `@Public()` (exempt from auth) and `@SkipThrottle()` (exempt from rate limiting).

### VERIFY:AE-MON-004 — Global exception filter as APP_FILTER

`GlobalExceptionFilter` is registered as `APP_FILTER` in `AppModule.providers` via NestJS DI — never in `main.ts`. It returns sanitized error responses with no stack traces in production. The response body includes the `correlationId` from `RequestContextService`. Request bodies are sanitized using `sanitizeLogContext` from the shared package before logging.

### VERIFY:AE-MON-005 — Application metrics endpoint

`GET /metrics` returns in-memory request/error counts, average response time, and uptime. The `ResponseTimeInterceptor` (registered as `APP_INTERCEPTOR`) measures request duration using `performance.now()` from `perf_hooks` and sets the `X-Response-Time` header on all responses.

---

## Observability Stack

```
Request → CorrelationIdMiddleware (assign/preserve ID)
  → RequestLoggingMiddleware (log method, URL, correlationId)
  → ThrottlerGuard → JwtAuthGuard → Controller → Service
  → ResponseTimeInterceptor (measure duration, set header)
  → GlobalExceptionFilter (catch errors, sanitize, log)
  → Response (with X-Correlation-ID + X-Response-Time headers)
```

---

## Log Sanitization

The `sanitizeLogContext` function in the shared package redacts sensitive fields from log entries. Redacted fields (case-insensitive): `password`, `passwordHash`, `token`, `accessToken`, `secret`, `authorization`. The sanitizer handles deep nested objects and arrays recursively.

---

## Health Response Format

```json
{
  "status": "ok",
  "timestamp": "2026-03-23T12:00:00.000Z",
  "uptime": 3600,
  "version": "1.0.0"
}
```

---

## Metrics Response Format

```json
{
  "requestCount": 1500,
  "errorCount": 12,
  "averageResponseTime": 45.2,
  "uptime": 3600
}
```
