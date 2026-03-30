# Monitoring Specification

## Overview

Health check endpoints for container orchestration and load balancers.
Provides liveness and readiness probes. No authentication required.
See [security.md](security.md) for security headers and rate limiting.

## Module Structure

<!-- VERIFY:API-MONITORING-MODULE -->
The `MonitoringModule` registers the monitoring controller. It does not import
auth modules since health endpoints are public.

<!-- VERIFY:API-MONITORING-CONTROLLER -->
The `MonitoringController` exposes health check endpoints:
- `GET /health` — Liveness probe (returns status, timestamp, version)
- `GET /health/ready` — Readiness probe (checks database connectivity)

Both endpoints are excluded from JWT authentication guards and rate limiting.

## Test Coverage

<!-- VERIFY:API-MONITORING-CONTROLLER-SPEC -->
Unit tests for MonitoringController verify that liveness returns 200 with
correct shape, readiness checks database connectivity, and error cases
return 503 when the database is unreachable.

## Application Bootstrap

<!-- VERIFY:API-MAIN -->
The `main.ts` entry point configures NestJS with global pipes (ValidationPipe),
filters (HttpExceptionFilter), interceptors (CorrelationInterceptor,
ResponseTimeInterceptor), and Helmet middleware. It reads PORT from environment.

## Root Module

<!-- VERIFY:API-APP-MODULE -->
The `AppModule` is the root NestJS module importing all feature modules:
AuthModule, VehicleModule, DriverModule, RouteModule, DispatchModule,
TripModule, MaintenanceModule, ZoneModule, and MonitoringModule. It registers
global guards (TenantGuard) and interceptors.

## Liveness Probe

- Returns 200 if the application process is running
- No external dependency checks
- Response: { status: "ok", timestamp, version }

## Readiness Probe

- Checks database connectivity via Prisma `$queryRaw` SELECT 1
- Returns 200 if database is reachable
- Returns 503 if database is unreachable
- Response: { status: "ok"|"error", timestamp, database }

## Implementation Notes

- SkipThrottle decorator applied to avoid rate limiting health checks
- Version pulled from shared APP_VERSION constant
- Health checks logged at debug level to avoid noise

## Cross-References

- Infrastructure setup: see [infrastructure.md](infrastructure.md)
- Security headers: see [security.md](security.md)
- Zones module: see [data-model.md](data-model.md)
