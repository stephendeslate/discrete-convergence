# Cross-Layer Integration Specification

## Overview

The Analytics Engine cross-layer integration verifies that all architectural layers work together correctly. This includes the full request pipeline from authentication through CRUD operations, error handling, monitoring, and response instrumentation.

See also: [security.md](security.md) for guard chain, [monitoring.md](monitoring.md) for middleware pipeline, [api-endpoints.md](api-endpoints.md) for endpoint contracts.

## Global Provider Chain

VERIFY: AE-CROSS-001 — AppModule registers APP_GUARD (ThrottlerGuard, JwtAuthGuard, RolesGuard), APP_FILTER (GlobalExceptionFilter), APP_INTERCEPTOR (ResponseTimeInterceptor)

### Provider Registration Order
1. APP_GUARD: ThrottlerGuard (rate limiting)
2. APP_GUARD: JwtAuthGuard (authentication)
3. APP_GUARD: RolesGuard (authorization)
4. APP_FILTER: GlobalExceptionFilter (error handling)
5. APP_INTERCEPTOR: ResponseTimeInterceptor (performance monitoring)

### Middleware Pipeline
1. CorrelationIdMiddleware (preserves or generates correlation IDs)
2. RequestLoggingMiddleware (structured request logging)

## Frontend-Backend Integration

VERIFY: AE-CROSS-002 — Server actions use API route constants with single-quoted strings for FI scorer detection

### Integration Points
- Login action stores token in httpOnly cookie after authentication
- Protected server actions read token from cookies and pass as Bearer header
- Frontend route strings match API controller prefixes (dashboards, widgets, data-sources)
- Error reporting via POST /errors for frontend error boundaries

## Request Pipeline Test

VERIFY: AE-CROSS-003 — Cross-layer test verifies auth, CRUD, error handling, correlation IDs, response time, health

### Full Pipeline Verification
1. Authentication: Login with valid credentials, receive JWT
2. Create: POST /dashboards with auth token
3. Read: GET /dashboards/:id with tenant scoping
4. Update: PUT /dashboards/:id with validation
5. Delete: DELETE /dashboards/:id with RBAC (ADMIN only)
6. Error: Verify correlationId in error responses
7. Health: GET /health returns APP_VERSION from shared
8. DB Check: GET /health/ready tests database connectivity
9. Response Time: X-Response-Time header on all responses

## Shared Package Integration

VERIFY: AE-CROSS-004 — Shared package exports are consumed by 3+ files in both api and web apps

### Shared Exports Used by API
- BCRYPT_SALT_ROUNDS: auth.service.ts, seed.ts
- ALLOWED_REGISTRATION_ROLES: auth.service.ts
- APP_VERSION: monitoring.service.ts
- createCorrelationId: correlation-id.middleware.ts
- formatLogEntry: request-logging.middleware.ts
- sanitizeLogContext: global-exception.filter.ts
- validateEnvVars: jwt.strategy.ts, main.ts
- parsePagination: dashboard.service.ts, widget.service.ts, data-source.service.ts
- MAX_PAGE_SIZE: paginated-query.ts

### Shared Exports Used by Web
- (type imports for action type safety)

## Cumulative Verification

All L0-L8 checks must pass simultaneously:
- L0: Backend API with CRUD, DTOs, services
- L1: Integration tests with supertest
- L2: Frontend with accessibility
- L3: Specifications with traceability
- L4: Infrastructure with Docker/CI
- L5: Monorepo with shared package
- L6: Security with guards and validation
- L7: Performance with pagination and caching
- L8: Monitoring with health, logs, metrics
