# Monitoring Specification

> **Project:** Event Management
> **Category:** MON
> **Cross-references:** See [cross-layer.md](cross-layer.md), [security.md](security.md)

---

## Requirements

### VERIFY:EM-MON-001 — Structured Logging

Pino logger in request middleware. Uses `formatLogEntry()` from shared package.
Logs: method, url, statusCode, duration (ms), correlationId. All log output is
structured JSON — no `console.log` in production API code. Logger injected via
NestJS dependency injection.

### VERIFY:EM-MON-002 — Correlation IDs

CorrelationIdMiddleware generates correlation ID via `createCorrelationId()` from shared
package, or preserves client-provided `X-Correlation-ID` header. Stored in
RequestContextService (request-scoped). Propagated to:
- All log entries via formatLogEntry
- Error responses via GlobalExceptionFilter
- Response headers as `X-Correlation-ID`

### VERIFY:EM-MON-003 — Health Endpoints

Three health endpoints in MonitoringController:
- `GET /health` — returns `{ status: 'ok', timestamp, uptime, version }` where version
  is `APP_VERSION` from shared package
- `GET /health/ready` — database connectivity check via `$queryRaw`
- `GET /metrics` — in-memory request/error counts, average response time, uptime

All health endpoints decorated with `@Public()` (bypass auth) and `@SkipThrottle()`
(bypass rate limiting). See [cross-layer.md](cross-layer.md) for provider chain.

### VERIFY:EM-MON-004 — Exception Filter

GlobalExceptionFilter registered as `APP_FILTER` in AppModule (not in main.ts).
Catches all exceptions and returns sanitized error responses:
- No stack traces in response body
- Uses `sanitizeLogContext()` from shared to redact sensitive fields (password,
  token, accessToken, secret, authorization) from logged request bodies
- Includes correlationId in error response body for request tracing
- Handles HttpException, Prisma errors, and unknown errors with appropriate status codes

### VERIFY:EM-MON-005 — Response Time

ResponseTimeInterceptor registered as `APP_INTERCEPTOR` in AppModule. Measures request
duration via `performance.now()` from `perf_hooks` module. Sets `X-Response-Time` header
in milliseconds on every response. Used for performance monitoring and SLA tracking.

---

## Verification Checklist

- [ ] Pino logger injected via DI (never console.log in api/src)
- [ ] CorrelationIdMiddleware generates or preserves X-Correlation-ID
- [ ] Health endpoints decorated with @Public() and @SkipThrottle()
- [ ] GlobalExceptionFilter uses sanitizeLogContext from shared
- [ ] Exception responses include correlationId in body
- [ ] ResponseTimeInterceptor uses performance.now() from perf_hooks
