# Cross-Layer Integration Specification

## Overview

The Analytics Engine uses a layered architecture where global providers,
middleware, guards, filters, and interceptors compose into a unified request
pipeline. This specification describes how the layers interact and the
integration contracts between them.

See also: [Authentication](authentication.md) for JWT guard details.
See also: [Security](security.md) for rate limiting and validation.
See also: [Monitoring](monitoring.md) for correlation IDs and logging.
See also: [Performance](performance.md) for response time tracking.

## Global Provider Chain

The NestJS AppModule registers three categories of global providers:

### APP_GUARD (executed in registration order)
1. ThrottlerGuard — rate limiting (skippable via @SkipThrottle())
2. JwtAuthGuard — JWT authentication (skippable via @Public())
3. RolesGuard — RBAC authorization (checks @Roles() metadata)

### APP_FILTER
1. GlobalExceptionFilter — catches all exceptions, returns sanitized JSON

### APP_INTERCEPTOR
1. ResponseTimeInterceptor — sets X-Response-Time header on all responses

## Request Pipeline Flow

1. **Middleware** (runs first, before guards)
   - CorrelationIdMiddleware: reads or generates X-Correlation-ID
   - RequestLoggingMiddleware: logs request start, attaches timing

2. **Guards** (run in APP_GUARD registration order)
   - ThrottlerGuard: checks rate limits, throws 429 if exceeded
   - JwtAuthGuard: validates JWT, attaches user to request (skipped for @Public)
   - RolesGuard: checks user role against @Roles() metadata

3. **Interceptors** (wrap the route handler)
   - ResponseTimeInterceptor: records start time, sets header on response

4. **Route Handler** (controller method executes)
   - Extracts tenant from req.user.tenantId
   - Calls service methods with tenant context

5. **Exception Filter** (catches thrown errors)
   - GlobalExceptionFilter: sanitizes error, adds correlationId to response

## Design Contracts

### Domain Controllers
- MUST NOT use @UseGuards(JwtAuthGuard) — rely on global guard
- MUST extract tenant from @Req() request object
- MUST use @Public() only for system endpoints (health, auth)

### Shared Package Usage
- The shared package (@analytics-engine/shared) is imported by >= 3 files
  in each app (api and web)
- Exports used: APP_VERSION, BCRYPT_SALT_ROUNDS, parsePagination,
  createCorrelationId, formatLogEntry, sanitizeLogContext, validateEnvVars,
  MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE, ALLOWED_REGISTRATION_ROLES

### Cross-Layer Test Coverage
The cross-layer integration test verifies the full pipeline:
- Authentication flow (register + login + token usage)
- CRUD operations with tenant isolation
- Error handling (404, validation errors)
- Correlation ID propagation
- Response time header presence
- Health endpoint accessibility
- RBAC enforcement across roles

## APP_VERSION Propagation

The APP_VERSION constant from the shared package appears in:
- Health endpoint response body (monitoring controller)
- CLAUDE.md project documentation
- Settings page in the web frontend

## Cumulative Regression

All layers (L0 through L8) must pass simultaneously. A change to any layer
must not break contracts in other layers. The cross-layer integration test
serves as the regression gate for this requirement.
