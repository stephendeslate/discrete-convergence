# Monitoring Specification

## Overview

Monitoring provides health check endpoints for orchestration (Kubernetes, Docker)
and observability via structured logging. The monitoring controller requires no
authentication. See [security.md](security.md) for header security details.

## Health Controller

<!-- VERIFY:MONITORING -->
The `MonitoringController` exposes three endpoints at the `/health` prefix:
- `GET /health` — Liveness check returning status, version, and timestamp
- `GET /health/ready` — Readiness check that verifies database connectivity
- `GET /health/metrics` — Application metrics including uptime and memory usage

All health endpoints are excluded from JWT authentication guards.

## Monitoring Tests

<!-- VERIFY:TEST-MONITORING -->
Unit tests for the monitoring controller verify that liveness returns 200 with
correct shape, readiness checks database connectivity, and metrics include
uptime and memory fields.

## Application Bootstrap

<!-- VERIFY:MAIN-BOOTSTRAP -->
The `main.ts` entry point configures NestJS with global pipes, filters,
interceptors, and Helmet middleware. It reads PORT from environment variables
and starts the HTTP listener. Pino logger is configured here with optional
pretty-printing in development mode.

## Root Module

<!-- VERIFY:APP-MODULE -->
The `AppModule` is the root NestJS module that imports all feature modules
(AuthModule, DashboardModule, WidgetModule, DataSourceModule, SyncHistoryModule,
AuditLogModule, MonitoringModule) and registers global guards, interceptors,
and filters via APP_GUARD and APP_INTERCEPTOR providers.

## Observability Stack

- Pino structured JSON logging (pino-pretty in development only)
- X-Correlation-ID propagated through request lifecycle
- X-Response-Time header on all responses
- Authorization headers redacted from logs
- Database health verified on readiness probe
- Error responses include correlationId for tracing

## Cross-References

- Correlation interceptor: see [security.md](security.md)
- Response time interceptor: see [security.md](security.md)
- Infrastructure setup: see [infrastructure.md](infrastructure.md)
