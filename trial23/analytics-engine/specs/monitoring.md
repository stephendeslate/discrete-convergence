# Monitoring Specification

> **Project:** Analytics Engine
> **Category:** MON
> **Related:** See [cross-layer.md](cross-layer.md) for global provider registration, see [security.md](security.md) for log sanitization context

---

## Overview

The analytics engine implements structured observability with Pino JSON logging, correlation ID propagation, request context tracking, health endpoints, and a global exception filter. All monitoring components use NestJS dependency injection and import utilities from the shared package. Logging is environment-aware with conditional formatting.

---

## Requirements

### VERIFY: AE-MON-001 — Pino structured JSON logging (pino-pretty conditional on NODE_ENV==='development')

The application uses Pino as its logger, configured for structured JSON output in production. When `NODE_ENV === 'development'`, the logger uses `pino-pretty` for human-readable formatted output in the console. In production (`NODE_ENV === 'production'`), raw JSON is emitted for log aggregation systems. The Pino logger is injectable via NestJS DI using `@nestjs/common` Logger — `console.log` is never used in `apps/api/src/`. Log entries are formatted using `formatLogEntry` from the shared package to ensure consistent structure with timestamp, level, message, and context fields.

### VERIFY: AE-MON-002 — CorrelationIdMiddleware reads X-Correlation-ID from request headers

`CorrelationIdMiddleware` checks for an existing `X-Correlation-ID` header on incoming requests. If present, it preserves the client-provided correlation ID for distributed tracing continuity. If absent, it generates a new UUID using `createCorrelationId()` from the shared package. The correlation ID is attached to the request object, set on the response `X-Correlation-ID` header, and included in all log entries for the request lifecycle. The middleware is applied globally via `app.use()` or module `configure()` to ensure every request has a correlation ID.

### VERIFY: AE-MON-003 — Health endpoint returns status, timestamp, uptime, version

`GET /health` returns a JSON response with four fields: `status` (string, "ok"), `timestamp` (ISO 8601 datetime string), `uptime` (number, seconds since process start via `process.uptime()`), and `version` (string, from `APP_VERSION` constant imported from the shared package). `GET /health/ready` additionally performs a database connectivity check via `$queryRaw` or `$queryRawUnsafe('SELECT 1')`. Both health endpoints are decorated with `@Public()` to bypass JWT auth and `@SkipThrottle()` to bypass rate limiting.

### VERIFY: AE-MON-004 — GlobalExceptionFilter sanitizes errors via sanitizeLogContext

`GlobalExceptionFilter` is registered as `APP_FILTER` in `AppModule.providers` via NestJS dependency injection — it is NOT registered in `main.ts`. The filter catches all unhandled exceptions and returns sanitized error responses. In production, stack traces are omitted from the response body. Request context (including request body) is sanitized using `sanitizeLogContext()` from the shared package before being written to logs. Sensitive fields like `password`, `token`, `secret`, and `authorization` are redacted to `[REDACTED]`. The error response includes `correlationId` from the request context for debugging.

---

## Observability Pipeline

```
Request → CorrelationIdMiddleware (assign/preserve X-Correlation-ID)
  → RequestLoggingMiddleware (log method, URL, correlationId)
  → ThrottlerGuard → JwtAuthGuard → Controller → Service
  → ResponseTimeInterceptor (measure duration, set X-Response-Time)
  → GlobalExceptionFilter (catch errors, sanitize, log)
  → Response (with X-Correlation-ID + X-Response-Time headers)
```

---

## Log Sanitization

The `sanitizeLogContext` function from the shared package redacts sensitive fields from log entries. Redacted fields (case-insensitive matching):
- `password` → `[REDACTED]`
- `passwordHash` → `[REDACTED]`
- `token` → `[REDACTED]`
- `accessToken` → `[REDACTED]`
- `refreshToken` → `[REDACTED]`
- `secret` → `[REDACTED]`
- `authorization` → `[REDACTED]`

The sanitizer handles deep nested objects and arrays recursively.

---

## Health Response Format

```json
{
  "status": "ok",
  "timestamp": "2026-03-25T12:00:00.000Z",
  "uptime": 3600,
  "version": "1.0.0"
}
```

---

## Readiness Response Format

```json
{
  "status": "ok",
  "timestamp": "2026-03-25T12:00:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "database": "connected"
}
```
