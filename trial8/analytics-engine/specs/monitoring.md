# Monitoring Specification

> **Project:** Analytics Engine
> **Category:** MON
> **Related:** See [security.md](security.md) for error handling, see [cross-layer.md](cross-layer.md) for provider chain

---

## Overview

The analytics engine implements comprehensive observability with structured logging (Pino), correlation ID propagation, health/readiness endpoints, and performance monitoring. All monitoring components integrate with the shared package for consistent formatting and sanitization.

---

## Requirements

### VERIFY:AE-MON-001 — Pino structured logging

Request logging middleware uses Pino for structured JSON output. Each log entry includes timestamp, method, URL, status code, response time, and correlation ID. The middleware imports `formatLogEntry` from the shared package to ensure consistent log formatting across environments.

### VERIFY:AE-MON-002 — Correlation ID middleware

The correlation ID middleware preserves an incoming `X-Correlation-ID` header or generates a new one using `createCorrelationId()` from the shared package. The correlation ID is set on the response headers and stored in the request-scoped context service for use in logging and error responses.

### VERIFY:AE-MON-003 — Health and readiness endpoints

Health endpoint (`GET /health`) returns `{ status: 'ok', timestamp, uptime, version }` where version is `APP_VERSION` from the shared package. Readiness endpoint (`GET /health/ready`) executes `SELECT 1` against the database and returns `{ status: 'ok', database: 'connected', timestamp }`. Both endpoints are decorated with `@Public()` and `@SkipThrottle()`.

### VERIFY:AE-MON-004 — Global exception filter

`GlobalExceptionFilter` is registered as a global `APP_FILTER`. It catches all exceptions, sanitizes the error context using `sanitizeLogContext` from the shared package, and returns a structured error response including the `correlationId` from the request context. Sensitive data is never exposed in error responses.

### VERIFY:AE-MON-005 — Response time interceptor

`ResponseTimeInterceptor` is registered as a global `APP_INTERCEPTOR`. It measures request processing time using `performance.now()` and sets the `X-Response-Time` header in the format `{milliseconds}ms` (e.g., `12.34ms`). The interceptor runs on all requests including public endpoints.

---

## Endpoint Summary

| Endpoint | Auth | Rate Limited | Description |
|----------|------|-------------|-------------|
| GET /health | Public | No | Basic health check |
| GET /health/ready | Public | No | Database readiness |
| GET /metrics | JWT | Yes | Application metrics |
