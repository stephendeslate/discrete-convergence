# Cross-Layer Integration Specification

> **Project:** Analytics Engine
> **Category:** CROSS
> **Related:** See [monitoring.md](monitoring.md) for provider details, see [security.md](security.md) for guard chain, see [infrastructure.md](infrastructure.md) for shared package

---

## Overview

Cross-layer integration ensures that all quality layers work together as a cohesive system. Global providers are registered exclusively through NestJS dependency injection in `AppModule`. The shared package provides utilities consumed by both `apps/api` and `apps/web`. Integration tests verify the full request pipeline from authentication through response formatting.

---

## Requirements

### VERIFY: AE-CROSS-001 — Global provider chain: APP_GUARD, APP_FILTER, APP_INTERCEPTOR in AppModule

AppModule registers all global providers via NestJS dependency injection tokens. The provider chain includes:
- `APP_GUARD` with `useClass: ThrottlerGuard` — rate limiting on all routes
- `APP_GUARD` with `useClass: JwtAuthGuard` — JWT authentication on all routes (bypassed by `@Public()`)
- `APP_FILTER` with `useClass: GlobalExceptionFilter` — error handling and log sanitization
- `APP_INTERCEPTOR` with `useClass: ResponseTimeInterceptor` — performance measurement

Domain controllers do NOT use `@UseGuards(JwtAuthGuard)`, `@UseFilters()`, or `@UseInterceptors()` for these global concerns. The order of provider registration determines execution order in the request pipeline. All providers are registered in `AppModule.providers` array, not in `main.ts`.

### VERIFY: AE-CROSS-002 — ResponseTimeInterceptor adds X-Response-Time header to all responses

`ResponseTimeInterceptor` is registered as `APP_INTERCEPTOR` in `AppModule.providers`. It measures request duration using `performance.now()` from Node.js `perf_hooks` module. The interceptor records the start time before the request handler executes, then calculates the elapsed time in the response Observable's `tap` operator. The elapsed time is set as the `X-Response-Time` header value in milliseconds (e.g., `X-Response-Time: 42.5`). This header is present on ALL responses including error responses, health checks, and authenticated endpoints.

### VERIFY: AE-CROSS-003 — Shared package exports used by >=3 files in each app

The shared package (`packages/shared/src/index.ts`) exports at least 8 named utilities. At least 3 files in `apps/api/src/` import from the shared package, and at least 3 files in `apps/web/` import from the shared package. The shared package is referenced in both app `package.json` files as a workspace dependency using `"@analytics-engine/shared": "workspace:*"`. Zero dead exports — every export has at least one consumer outside the shared package.

Shared package exports and their consumers:

| Export | Type | API Consumers | Web Consumers |
|--------|------|---------------|---------------|
| BCRYPT_SALT_ROUNDS | constant | auth.service.ts | — |
| ALLOWED_REGISTRATION_ROLES | constant | register.dto.ts | register page |
| APP_VERSION | constant | monitoring.controller.ts | layout.tsx |
| createCorrelationId | function | correlation-id.middleware.ts | — |
| formatLogEntry | function | request-logging.middleware.ts | — |
| sanitizeLogContext | function | global-exception.filter.ts | — |
| validateEnvVars | function | main.ts | — |
| clampPagination | function | dashboard.service.ts, data-source.service.ts, widget.service.ts | actions.ts |
| DEFAULT_PAGE_SIZE | constant | — | actions.ts, data-sources page |
| MAX_PAGE_SIZE | constant | — | actions.ts |

---

## Provider Registration Pattern

```typescript
// apps/api/src/app.module.ts — providers array
providers: [
  { provide: APP_GUARD, useClass: ThrottlerGuard },
  { provide: APP_GUARD, useClass: JwtAuthGuard },
  { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  { provide: APP_INTERCEPTOR, useClass: ResponseTimeInterceptor },
  RequestContextService,
]
```

---

## Integration Test Coverage

The cross-layer integration test (`cross-layer.integration.spec.ts`) verifies the complete pipeline:
1. Authentication flow: register → login → receive token
2. CRUD operations: create dashboard → list → update → delete
3. Error handling: invalid requests return structured errors with correlationId
4. Correlation IDs: X-Correlation-ID header present on all responses
5. Response time: X-Response-Time header present on all responses
6. Health endpoints: /health and /health/ready return expected format
7. Tenant isolation: cross-tenant access returns 404 or empty results

---

## Cumulative Quality Checks

Cross-layer integration verifies all prior layer checks pass simultaneously:
- CRUD operations return correct status codes (200, 201, 404)
- Integration tests compile with real AppModule (not mocked)
- VERIFY/TRACED tag parity maintained across specs and source
- Build succeeds via `pnpm turbo run build`
- Shared package imports resolve without errors
- Security headers present on all responses
- Response time headers present on all responses
- Correlation IDs propagated through request lifecycle
