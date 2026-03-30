# Cross-Layer Specification

> **Cross-references:** See [authentication.md](authentication.md), [security.md](security.md), [monitoring.md](monitoring.md), [api-endpoints.md](api-endpoints.md)

## Overview

Fleet Dispatch cross-layer integration ensures that global guards, filters,
interceptors, decorators, and shared utilities work together correctly.
This spec covers the wiring between modules and the integration test suite.

## Global Guard Chain

### JwtAuthGuard
- VERIFY:FD-CL-001 — JwtAuthGuard as APP_GUARD, skipping @Public() routes
- Registered as APP_GUARD in AppModule providers array
- Uses Reflector to check IS_PUBLIC_KEY metadata
- @Public() routes bypass authentication check
- All other routes require valid JWT Bearer token

### @Public() Decorator
- VERIFY:FD-CL-002 — @Public() decorator for auth/health exemption
- Sets IS_PUBLIC_KEY = true via SetMetadata
- Applied to: auth login, auth register, health, health/ready, metrics
- Checked by JwtAuthGuard before enforcing authentication

### AppModule Wiring
- VERIFY:FD-CL-003 — AppModule with APP_GUARD, APP_FILTER, APP_INTERCEPTOR
- APP_GUARD providers (order matters):
  1. ThrottlerGuard — rate limiting first
  2. JwtAuthGuard — authentication second
- APP_FILTER: GlobalExceptionFilter — catches all unhandled exceptions
- APP_INTERCEPTOR: ResponseTimeInterceptor — measures response timing
- Middleware: CorrelationIdMiddleware, RequestLoggingMiddleware for all routes
- Module imports: Auth, WorkOrders, Technicians, Customers, Invoices, Routes, Monitoring

## Integration Test Coverage

### Cross-Layer Tests
- VERIFY:FD-CL-004 — Cross-layer integration tests
- Verifies global guard registration (ThrottlerGuard, JwtAuthGuard)
- Verifies global filter registration (GlobalExceptionFilter)
- Verifies global interceptor registration (ResponseTimeInterceptor)
- Verifies middleware chain (CorrelationId, RequestLogging)
- Verifies all 7 domain modules are registered
- Verifies shared package consumption (clampPagination, BCRYPT_SALT_ROUNDS, APP_VERSION)

### Test Coverage Map

| Tag | Description | Test File |
|-----|-------------|-----------|
| FD-TEST-001 | Auth service unit tests | auth.service.spec.ts |
| FD-TEST-002 | Work orders service unit tests | work-orders.service.spec.ts |
| FD-TEST-003 | Technicians service unit tests | technicians.service.spec.ts |
| FD-TEST-004 | Auth integration tests | test/auth.integration.spec.ts |
| FD-TEST-005 | Work orders integration tests | test/work-orders.integration.spec.ts |
| FD-TEST-006 | Monitoring tests | test/monitoring.spec.ts |

### Unit Tests
- VERIFY:FD-TEST-001 — Auth service unit tests (register, login, JWT, bcrypt)
- VERIFY:FD-TEST-002 — Work orders service unit tests (CRUD, state machine, pagination)
- VERIFY:FD-TEST-003 — Technicians service unit tests (CRUD, GPS, RLS)

### Integration Tests
- VERIFY:FD-TEST-004 — Auth integration tests (validation, JWT flow)
- VERIFY:FD-TEST-005 — Work orders integration tests (state machine, pagination, cache)
- VERIFY:FD-TEST-006 — Monitoring tests (health, readiness, metrics)

## Shared Package Consumption

The @fleet-dispatch/shared package is consumed by both apps:

**apps/api consumers:**
- BCRYPT_SALT_ROUNDS: auth.service.ts, prisma/seed.ts
- ALLOWED_REGISTRATION_ROLES: auth/dto/register.dto.ts
- APP_VERSION: monitoring.controller.ts
- clampPagination: work-orders, technicians, customers, invoices, routes services
- createCorrelationId: correlation-id.middleware.ts
- formatLogEntry: request-logging.middleware.ts
- sanitizeLogContext: global-exception.filter.ts
- validateEnvVars: main.ts

**apps/web consumers:**
- APP_VERSION: app/layout.tsx
- ALLOWED_REGISTRATION_ROLES: app/register/page.tsx
- validateEnvVars: app/settings/page.tsx (import reference)

## Cross-References

- Auth details: see auth.md (FD-AUTH-*)
- Security guards: see security.md (FD-SEC-002, FD-SEC-003)
- Monitoring details: see monitoring.md (FD-MON-*)
