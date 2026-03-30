# Cross-Layer Integration Specification

## Overview

Fleet Dispatch coordinates multiple layers through NestJS middleware, guards,
interceptors, and filters registered as APP_GUARD/APP_FILTER/APP_INTERCEPTOR.
This document covers how these layers interact during request processing.

Cross-references: [authentication.md](authentication.md), [security.md](security.md)

## Request Processing Pipeline

1. CorrelationIdMiddleware — assigns/propagates X-Correlation-ID
2. RequestLoggingMiddleware — logs incoming request details
3. ThrottlerGuard (APP_GUARD) — rate limiting check
4. JwtAuthGuard (APP_GUARD) — JWT token validation (skipped for @Public())
5. RolesGuard (APP_GUARD) — RBAC check (skipped when no @Roles())
6. ValidationPipe — DTO validation (whitelist + forbidNonWhitelisted)
7. Controller handler — business logic execution
8. ResponseTimeInterceptor (APP_INTERCEPTOR) — measures duration, sets header
9. GlobalExceptionFilter (APP_FILTER) — catches errors, sanitizes, responds

## Guard Chain

Guards execute in registration order: ThrottlerGuard, JwtAuthGuard, RolesGuard.
If any guard returns false or throws, the request is rejected before reaching
the controller. The @Public() decorator skips JwtAuthGuard, and endpoints
without @Roles() pass through RolesGuard automatically.

## Middleware Chain

Middlewares apply to all routes ('*') and execute before guards:
- CorrelationIdMiddleware: checks for X-Correlation-ID header, generates if absent
- RequestLoggingMiddleware: registers 'finish' event listener for completion logging

## Dashboard and DataSource Integration

DashboardController and DataSourceController are placeholder endpoints that
demonstrate the cross-layer integration pattern:
- Protected by APP_GUARD chain (auth required)
- Accept @Req() to access tenant context from JWT
- Return empty arrays (ready for future implementation)
- Accessible via GET /dashboards and GET /data-sources

## Tenant Context Propagation

1. JWT payload contains tenantId
2. JwtStrategy validates token and sets req.user
3. Controllers access req.user.tenantId via @Req()
4. Services filter all queries by tenantId parameter
5. Database RLS provides additional isolation layer

Cross-references: [monitoring.md](monitoring.md), [data-model.md](data-model.md)

## VERIFY Tags

- VERIFY: FD-CROSS-001 — Dashboard controller returns empty array with tenant context
- VERIFY: FD-CROSS-002 — DataSource controller returns empty array with tenant context
- VERIFY: FD-CROSS-003 — App module registers all guards, filters, interceptors

## Error Propagation

Errors thrown at any layer are caught by GlobalExceptionFilter:
- HttpException: status code and message extracted
- Unknown exceptions: 500 Internal Server Error with sanitized context
- All errors include correlationId and timestamp in response
- Sensitive data stripped from log output via sanitizeLogContext()

## Integration Testing

Cross-layer tests verify:
- Validation pipeline enforcement on malformed requests
- Correlation ID propagation through error responses
- Auth context propagation through middleware chain
- RBAC enforcement across controller/guard layers
- Pagination parameter handling across layers
