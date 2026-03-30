# Cross-Layer Specification

> **Project:** Event Management
> **Domain:** CROSS
> **VERIFY Tags:** EM-CROSS-001 – EM-CROSS-003

---

## Overview

Cross-cutting concerns implemented as global NestJS providers. These providers
are registered in AppModule and apply to all routes unless explicitly bypassed.
The shared package provides utilities consumed by both the API and web apps.

---

## Requirements

### EM-CROSS-001: Global Providers in AppModule

<!-- VERIFY: EM-CROSS-001 -->

- APP_GUARD providers: ThrottlerGuard, JwtAuthGuard, RolesGuard.
- APP_FILTER provider: GlobalExceptionFilter.
- APP_INTERCEPTOR provider: ResponseTimeInterceptor.
- All registered in AppModule's `providers` array using injection tokens.
- Order of guards matters: ThrottlerGuard runs before JwtAuthGuard.

### EM-CROSS-002: ResponseTimeInterceptor

<!-- VERIFY: EM-CROSS-002 -->

- Implements `NestInterceptor` interface.
- Measures request duration using `Date.now()` before and after handler.
- Sets `X-Response-Time` header with duration in milliseconds (e.g., `12ms`).
- Registered as APP_INTERCEPTOR for global application.
- Enables performance monitoring and SLA tracking.

### EM-CROSS-003: Shared Package Consumption

<!-- VERIFY: EM-CROSS-003 -->

- `@repo/shared` package consumed by both `apps/api` and `apps/web`.
- Exports include: APP_VERSION, BCRYPT_SALT_ROUNDS, ALLOWED_REGISTRATION_ROLES,
  MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE, clampPagination, createCorrelationId,
  formatLogEntry, sanitizeLogContext, validateEnvVars.
- At least 3 exports consumed in each app.
- Zero dead exports — every export has at least one consumer.

---

## Middleware Chain

```
Request
  → CorrelationIdMiddleware (set/read X-Correlation-ID)
  → RequestLoggingMiddleware (log method, path, status, duration)
  → ThrottlerGuard (rate limiting)
  → JwtAuthGuard (authentication)
  → RolesGuard (authorization)
  → ResponseTimeInterceptor (timing)
  → Controller handler
  → ResponseTimeInterceptor (set header)
  → GlobalExceptionFilter (on error)
  → Response
```

---

## Shared Package Exports

| Export                    | API Consumer                      | Web Consumer         |
|---------------------------|-----------------------------------|--------------------- |
| APP_VERSION               | HealthController                  | Layout/Footer        |
| BCRYPT_SALT_ROUNDS        | AuthService, seed.ts              | —                    |
| ALLOWED_REGISTRATION_ROLES| AuthService, AuthController       | RegisterPage         |
| MAX_PAGE_SIZE             | PaginatedQuery DTO                | —                    |
| DEFAULT_PAGE_SIZE         | clampPagination                   | —                    |
| clampPagination           | All service.findAll methods       | —                    |
| createCorrelationId       | CorrelationIdMiddleware           | —                    |
| sanitizeLogContext        | GlobalExceptionFilter             | —                    |
| validateEnvVars           | main.ts                           | —                    |
