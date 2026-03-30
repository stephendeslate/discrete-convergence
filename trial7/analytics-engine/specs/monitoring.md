# Monitoring Specification

## Overview

The Analytics Engine monitoring layer provides structured logging, request
tracing via correlation IDs, health checks, metrics collection, and error
reporting. See [security.md](security.md) for error sanitization details.

## Structured Logging

- VERIFY: AE-MON-001 — Pino-based LoggerService provides structured JSON logging via DI

Pino logger configured as NestJS LoggerService implementation:
- JSON format for production
- Configurable log level via LOG_LEVEL env
- Injected via DI (never console.log)

## Correlation ID

- VERIFY: AE-MON-002 — CorrelationIdMiddleware preserves or generates X-Correlation-ID header

CorrelationIdMiddleware:
- Preserves client-provided X-Correlation-ID header
- Generates UUID via createCorrelationId from shared if not present
- Sets header on request for downstream use

## Request Logging

- VERIFY: AE-MON-003 — RequestLoggingMiddleware logs method, URL, status, duration, correlationId

RequestLoggingMiddleware:
- Logs on response finish event
- Includes: method, URL, status code, duration (ms), correlationId
- Uses formatLogEntry from shared for consistent structure

## Request Context

- VERIFY: AE-MON-004 — RequestContextService provides request-scoped context (correlationId, userId, tenantId)

Request-scoped service storing:
- correlationId
- userId
- tenantId

## Health Endpoints

- VERIFY: AE-MON-005 — MonitoringController exposes /health, /health/ready, /metrics, and /errors endpoints
- VERIFY: AE-MON-006 — GET /health/ready checks DB connectivity via $queryRaw

### GET /health (Public, SkipThrottle)
Returns: { status: 'ok', timestamp, uptime, version }
- Version from APP_VERSION shared constant

### GET /health/ready (Public, SkipThrottle)
Returns: { status: 'ready'|'not_ready', database: 'connected'|'disconnected' }
- Uses $queryRaw for DB connectivity check

### GET /metrics (Public, SkipThrottle)
Returns: { requestCount, errorCount, avgResponseTime, uptime }
- In-memory counters (resets on restart)

### POST /errors (Public)
Accepts: { message, stack?, url? }
Returns: { received: true }
- Frontend error boundary integration

## Monitoring Service

- VERIFY: AE-MON-007 — MonitoringService tracks request counts, error counts, and average response time

In-memory metrics:
- requestCount — total requests tracked
- errorCount — total errors recorded
- avgResponseTime — computed from total/count
- uptime — process.uptime()

## Middleware Order

Applied via AppModule configure():
1. CorrelationIdMiddleware — assigns correlation ID
2. RequestLoggingMiddleware — logs request completion

Both applied to all routes via forRoutes('*').
