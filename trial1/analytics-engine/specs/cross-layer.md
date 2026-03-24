# Cross-Layer Integration Specification

> **Project:** Analytics Engine
> **Category:** CROSS
> **Related:** See [monitoring.md](monitoring.md) for provider details, see [security.md](security.md) for guard chain, see [infrastructure.md](infrastructure.md) for shared package

---

## Overview

Cross-layer integration ensures that all quality layers (L0–L8) work together as a cohesive system. Global providers are registered exclusively through NestJS dependency injection in `AppModule`. The shared package provides utilities consumed by both `apps/api` and `apps/web`. Integration tests verify the full request pipeline from authentication through response.

---

## Requirements

### VERIFY:AE-CROSS-001 — Global provider chain in AppModule

AppModule registers all global providers via NestJS DI: `APP_GUARD` (ThrottlerGuard + JwtAuthGuard), `APP_FILTER` (GlobalExceptionFilter), `APP_INTERCEPTOR` (ResponseTimeInterceptor). Domain controllers do NOT use `@UseGuards(JwtAuthGuard)` or register their own filters/interceptors — they rely on the global chain.

### VERIFY:AE-CROSS-002 — Shared package with consumed exports

The shared package (`packages/shared/src/index.ts`) exports at least 8 named utilities, each consumed by at least one file in `apps/api` or `apps/web`. Exports include: `BCRYPT_SALT_ROUNDS`, `ALLOWED_REGISTRATION_ROLES`, `APP_VERSION`, `createCorrelationId`, `formatLogEntry`, `sanitizeLogContext`, `validateEnvVars`, `clampPagination`. Zero dead exports — every export has at least one consumer outside the shared package.

### VERIFY:AE-CROSS-003 — Cross-layer integration test

An integration test (`cross-layer.integration.spec.ts`) verifies the full pipeline: auth → CRUD → error handling → correlation IDs → response time → health → DB check. The test uses supertest with a real AppModule compilation to ensure all layers interact correctly.

### VERIFY:AE-CROSS-004 — Shared package consumed by both apps

At least 3 files in `apps/api` import from the shared package (workspace:* protocol). At least 3 files in `apps/web` import from the shared package. The shared package is referenced in both app `package.json` files as a workspace dependency.

---

## Provider Registration

```typescript
// apps/api/src/app.module.ts
providers: [
  { provide: APP_GUARD, useClass: ThrottlerGuard },
  { provide: APP_GUARD, useClass: JwtAuthGuard },
  { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  { provide: APP_INTERCEPTOR, useClass: ResponseTimeInterceptor },
]
```

---

## Shared Package Exports

| Export | Type | Consumers |
|--------|------|-----------|
| BCRYPT_SALT_ROUNDS | constant | auth.service.ts, seed.ts |
| ALLOWED_REGISTRATION_ROLES | constant | register.dto.ts |
| APP_VERSION | constant | monitoring.controller.ts |
| createCorrelationId | function | correlation-id.middleware.ts |
| formatLogEntry | function | request-logging.middleware.ts |
| sanitizeLogContext | function | global-exception.filter.ts |
| validateEnvVars | function | main.ts |
| clampPagination | function | dashboard.service.ts, data-source.service.ts, widget.service.ts |

---

## Cumulative Regression

Cross-layer integration verifies ALL prior layer checks pass simultaneously:
- L0: CRUD operations return correct status codes
- L1: Integration tests compile with real AppModule
- L3: VERIFY/TRACED parity maintained
- L4: Build succeeds (pnpm turbo run build)
- L5: Shared package imports resolve
- L6: Security headers present
- L7: Response time headers present
- L8: Correlation IDs propagated
