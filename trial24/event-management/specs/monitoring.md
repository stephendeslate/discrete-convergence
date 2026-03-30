# Monitoring Specification

## Overview

Health check endpoints for container orchestration and load balancer probes.
These endpoints do not require authentication. See [security.md](security.md) for
security headers and rate limiting.

## Module Structure

<!-- VERIFY:MONITORING-MODULE -->
The `MonitoringModule` registers the monitoring controller. It does not import
auth modules since health endpoints are public.

<!-- VERIFY:MONITORING-CONTROLLER -->
The `MonitoringController` exposes health check endpoints:
- `GET /health` — Liveness probe (returns status, timestamp, version)
- `GET /health/ready` — Readiness probe (checks database connectivity)

Both endpoints are excluded from JWT authentication guards.

## Test Coverage

<!-- VERIFY:MONITORING-CONTROLLER-SPEC -->
Unit tests for MonitoringController verify that liveness returns 200 with
correct shape, readiness checks database connectivity, and error cases
return 503 when the database is unreachable.

## Application Bootstrap

<!-- VERIFY:MAIN -->
The `main.ts` entry point configures NestJS with global pipes (ValidationPipe),
filters (HttpExceptionFilter), interceptors (CorrelationInterceptor,
ResponseTimeInterceptor), and Helmet middleware. It reads PORT from environment.

## Root Module

<!-- VERIFY:APP-MODULE -->
The `AppModule` is the root NestJS module importing all feature modules:
AuthModule, EventModule, VenueModule, SessionModule, SpeakerModule,
TicketModule, AttendeeModule, and MonitoringModule. It registers global
guards (TenantGuard) and interceptors.

## Liveness Probe

- Returns 200 if the application process is running
- No external dependency checks
- Response: { status: "ok", timestamp, version }

## Readiness Probe

- Checks database connectivity via SELECT 1
- Returns 200 if database is reachable
- Returns 503 if database is unreachable
- Response: { status: "ok"|"error", timestamp, database: "connected"|"disconnected" }

## Cross-References

- Infrastructure setup: see [infrastructure.md](infrastructure.md)
- Security headers: see [security.md](security.md)
- Error handling: see [security.md](security.md)
