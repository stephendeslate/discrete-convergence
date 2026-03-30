# Monitoring Specification

> **Project:** Fleet Dispatch
> **Category:** MON
> **Related:** See [security.md](security.md) for error handling, see [infrastructure.md](infrastructure.md) for healthcheck

---

## Overview

The fleet dispatch API implements structured logging with Pino, correlation ID propagation, response time measurement, and health/readiness endpoints. All monitoring components are integrated via NestJS middleware, filters, and interceptors.

---

## Requirements

### VERIFY:FD-MON-001 — Pino structured logging

Request logging middleware uses Pino for structured JSON output. Each log entry includes HTTP method, URL, status code, and correlation ID. The `formatLogEntry()` function from the shared package is used to format entries.

### VERIFY:FD-MON-002 — Correlation ID middleware

The correlation ID middleware reads `X-Correlation-ID` from incoming requests or generates a new one using `createCorrelationId()` from the shared package. The correlation ID is set on the response headers and stored in the request context for downstream use.

### VERIFY:FD-MON-003 — Health and readiness endpoints

The monitoring controller exposes `GET /health` (basic status, version, uptime) and `GET /health/ready` (database connectivity check via `$queryRaw`). Both endpoints are `@Public()` and `@SkipThrottle()`. The health endpoint returns `APP_VERSION` from the shared package.

### VERIFY:FD-MON-004 — GlobalExceptionFilter

The global exception filter catches all unhandled exceptions and returns structured error responses with the correlation ID. It uses `sanitizeLogContext()` from the shared package to redact sensitive data before logging.

### VERIFY:FD-MON-005 — ResponseTimeInterceptor

The response time interceptor measures request processing time using `performance.now()` and sets the `X-Response-Time` header with the duration in milliseconds (format: `123.45ms`).

---

## Observable Signals

| Signal | Source | Header/Field |
|--------|--------|-------------|
| Correlation ID | Middleware | X-Correlation-ID |
| Response Time | Interceptor | X-Response-Time |
| Health Status | Controller | GET /health |
| DB Ready | Controller | GET /health/ready |
| Error Context | Filter | correlationId in error body |
| App Version | Controller | version in health response |
