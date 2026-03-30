# Cross-Layer Integration Specification

## Overview

This specification defines the cross-layer integration requirements for Fleet Dispatch.
Cross-layer integration ensures that all layers (backend, frontend, infrastructure,
security, monitoring, performance) work together as a cohesive system.
See [security.md](security.md) and [monitoring.md](monitoring.md) for layer-specific details.

## Global Provider Chain

The NestJS application uses a global provider chain registered in AppModule:

1. **APP_GUARD: ThrottlerGuard** — Rate limiting with named configs (default: 100/min, auth: 5/min)
2. **APP_GUARD: JwtAuthGuard** — JWT authentication for all routes (skips @Public())
3. **APP_FILTER: GlobalExceptionFilter** — Sanitized error responses with correlationId
4. **APP_INTERCEPTOR: ResponseTimeInterceptor** — X-Response-Time header via perf_hooks

Domain controllers must NOT use @UseGuards(JwtAuthGuard). The global guard chain
handles authentication for all routes. Only @Public() exempts specific routes.

## Middleware Chain

Applied to all routes via AppModule.configure():
1. CorrelationIdMiddleware — preserves or generates X-Correlation-ID
2. RequestLoggingMiddleware — structured request logging with duration

## Cross-Layer Test Coverage

The cross-layer integration test must verify the full pipeline end-to-end:

### Authentication Layer
- Protected endpoints return 401 without valid JWT
- Public endpoints (@Public()) are accessible without auth
- Error responses include correlationId (not just status codes)

### Monitoring Layer
- Health endpoint returns APP_VERSION from shared package
- X-Correlation-ID header present on all responses
- Client-provided correlation ID is preserved (not overwritten)
- Metrics endpoint accessible without auth

### Performance Layer
- X-Response-Time header present on all responses (including errors)
- Response time format is "N.NNms"

### Security Layer
- Error responses do not contain stack traces
- Request body sanitized before logging (sensitive fields redacted)

## Shared Package Integration

The shared package (@fleet-dispatch/shared) must be consumed by:

### apps/api (>= 3 files):
1. auth/auth.service.ts — BCRYPT_SALT_ROUNDS
2. auth/dto/register.dto.ts — ALLOWED_REGISTRATION_ROLES
3. monitoring/monitoring.controller.ts — APP_VERSION
4. common/correlation-id.middleware.ts — createCorrelationId
5. common/request-logging.middleware.ts — formatLogEntry
6. common/global-exception.filter.ts — sanitizeLogContext
7. main.ts — validateEnvVars
8. work-order/work-order.service.ts — clampPagination
9. technician/technician.service.ts — clampPagination
10. invoice/invoice.service.ts — clampPagination
11. customer/customer.service.ts — clampPagination

### apps/web (>= 3 files):
1. lib/actions.ts — validateEnvVars (imported)
2. components/nav.tsx — APP_VERSION
3. app/dashboard/page.tsx — (via nav component)

## Version Consistency

APP_VERSION must be consistent across:
- packages/shared/src/constants.ts (source of truth)
- GET /health response body
- Nav component display
- CLAUDE.md documentation

## Cumulative Regression

All prior layer checks must pass simultaneously:
- L0: Backend API compiles and routes resolve
- L1: Integration tests pass with real AppModule
- L2: Frontend builds and renders
- L3: VERIFY/TRACED parity at 100%
- L4: Docker builds, CI config valid
- L5: Monorepo installs and builds
- L6: Security headers present
- L7: Response time headers present
- L8: Health endpoints respond
- L9: Cross-layer test passes
