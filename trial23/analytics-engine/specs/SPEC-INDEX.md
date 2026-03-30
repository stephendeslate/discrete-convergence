# Analytics Engine — Specification Index

> **Project:** Analytics Engine
> **Trial:** 23 (discrete-convergence)
> **Spec Prefix:** AE-
> **Last Updated:** 2026-03-25

---

## Project Overview

The Analytics Engine is a multi-tenant embeddable analytics platform built with NestJS 11, Prisma 6, Next.js 15, React 19, and Tailwind CSS 4. The monorepo is managed with Turborepo and pnpm workspaces, organized into `apps/api` (NestJS backend), `apps/web` (Next.js frontend), and `packages/shared` (shared TypeScript utilities).

---

## Specification Documents

| # | Document | Domain | VERIFY Tags | Description |
|---|----------|--------|-------------|-------------|
| 1 | [authentication.md](authentication.md) | AUTH | AE-AUTH-001 – AE-AUTH-005 | JWT auth, bcrypt, registration, guards, rate limiting |
| 2 | [data-model.md](data-model.md) | DATA | AE-DATA-001 – AE-DATA-006 | Prisma schema, indexes, RLS, enums, sync history |
| 3 | [api-endpoints.md](api-endpoints.md) | API | AE-API-001 – AE-API-004 | REST CRUD, pagination, tenant scoping |
| 4 | [frontend.md](frontend.md) | FE | AE-FE-001 – AE-FE-004 | Next.js app, cookies, server actions, accessibility |
| 5 | [infrastructure.md](infrastructure.md) | INFRA | AE-INFRA-001 – AE-INFRA-004 | Docker, CI/CD, env validation |
| 6 | [security.md](security.md) | SEC | AE-SEC-001 – AE-SEC-005 | Helmet, throttling, CORS, validation, secrets |
| 7 | [monitoring.md](monitoring.md) | MON | AE-MON-001 – AE-MON-004 | Pino logging, correlation IDs, health, exception filter |
| 8 | [cross-layer.md](cross-layer.md) | CROSS | AE-CROSS-001 – AE-CROSS-003 | Global providers, interceptors, shared package |
| 9 | [edge-cases.md](edge-cases.md) | EDGE | AE-EDGE-001 – AE-EDGE-010 | Boundary, error, and failure handling |

---

## Traceability Matrix

| VERIFY Tag | Domain | Spec File | Summary |
|------------|--------|-----------|---------|
| AE-AUTH-001 | AUTH | authentication.md | JWT login with bcryptjs + BCRYPT_SALT_ROUNDS |
| AE-AUTH-002 | AUTH | authentication.md | Registration role restriction (ADMIN excluded) |
| AE-AUTH-003 | AUTH | authentication.md | Refresh token validation and reissuance |
| AE-AUTH-004 | AUTH | authentication.md | Global JwtAuthGuard as APP_GUARD |
| AE-AUTH-005 | AUTH | authentication.md | Login rate limiting via @Throttle |
| AE-DATA-001 | DATA | data-model.md | Prisma @@map('snake_case') on all models |
| AE-DATA-002 | DATA | data-model.md | Decimal @db.Decimal(12,2) for monetary fields |
| AE-DATA-003 | DATA | data-model.md | Indexes on tenantId, status, composites |
| AE-DATA-004 | DATA | data-model.md | RLS ENABLE + FORCE + CREATE POLICY |
| AE-DATA-005 | DATA | data-model.md | User email unique constraint |
| AE-DATA-006 | DATA | data-model.md | SyncHistory tracks FAILED status with errorMessage |
| AE-API-001 | API | api-endpoints.md | Dashboard CRUD with tenant scoping |
| AE-API-002 | API | api-endpoints.md | Widget CRUD with dashboard association |
| AE-API-003 | API | api-endpoints.md | DataSource CRUD with sync and history |
| AE-API-004 | API | api-endpoints.md | Pagination via clampPagination (MAX_PAGE_SIZE=100) |
| AE-FE-001 | FE | frontend.md | Token in httpOnly cookie |
| AE-FE-002 | FE | frontend.md | Server actions with Authorization bearer header |
| AE-FE-003 | FE | frontend.md | loading.tsx with role="status" aria-busy="true" |
| AE-FE-004 | FE | frontend.md | error.tsx with role="alert" and focus management |
| AE-INFRA-001 | INFRA | infrastructure.md | Multi-stage Dockerfile, prisma generate before tsc |
| AE-INFRA-002 | INFRA | infrastructure.md | docker-compose PostgreSQL 16 healthcheck |
| AE-INFRA-003 | INFRA | infrastructure.md | CI: lint + test + build + typecheck + audit |
| AE-INFRA-004 | INFRA | infrastructure.md | validateEnvVars at startup |
| AE-SEC-001 | SEC | security.md | Helmet CSP default-src self, frame-ancestors none |
| AE-SEC-002 | SEC | security.md | ThrottlerModule limit >= 20000 |
| AE-SEC-003 | SEC | security.md | CORS from CORS_ORIGIN env, credentials true |
| AE-SEC-004 | SEC | security.md | ValidationPipe whitelist + forbidNonWhitelisted |
| AE-SEC-005 | SEC | security.md | No hardcoded secret fallbacks |
| AE-MON-001 | MON | monitoring.md | Pino JSON logging, pino-pretty in development |
| AE-MON-002 | MON | monitoring.md | CorrelationIdMiddleware reads X-Correlation-ID |
| AE-MON-003 | MON | monitoring.md | Health returns status, timestamp, uptime, version |
| AE-MON-004 | MON | monitoring.md | GlobalExceptionFilter sanitizes via sanitizeLogContext |
| AE-CROSS-001 | CROSS | cross-layer.md | APP_GUARD + APP_FILTER + APP_INTERCEPTOR in AppModule |
| AE-CROSS-002 | CROSS | cross-layer.md | ResponseTimeInterceptor X-Response-Time header |
| AE-CROSS-003 | CROSS | cross-layer.md | Shared package >= 3 consumers per app |
| AE-EDGE-001 | EDGE | edge-cases.md | Duplicate email → 409 Conflict |
| AE-EDGE-002 | EDGE | edge-cases.md | Invalid JWT → 401 Unauthorized |
| AE-EDGE-003 | EDGE | edge-cases.md | Dashboard not found → 404 |
| AE-EDGE-004 | EDGE | edge-cases.md | Malformed body → 400 Bad Request |
| AE-EDGE-005 | EDGE | edge-cases.md | Null pagination → DEFAULT_PAGE_SIZE boundary |
| AE-EDGE-006 | EDGE | edge-cases.md | Overflow page size → MAX_PAGE_SIZE boundary |
| AE-EDGE-007 | EDGE | edge-cases.md | Forbidden ADMIN role → 403 |
| AE-EDGE-008 | EDGE | edge-cases.md | Sync invalid ID → 404 Not Found |
| AE-EDGE-009 | EDGE | edge-cases.md | Sync error → FAILED status with error message |
| AE-EDGE-010 | EDGE | edge-cases.md | No token → 401 Unauthorized |

**Total VERIFY tags: 45**

---

## Tag Convention

- **Prefix:** `AE-` (Analytics Engine)
- **Format:** VERIFY tags in spec files, TRACED tags in .ts/.tsx source files only
- **TRACED restriction:** TRACED tags appear ONLY in `.ts` and `.tsx` files — never in `.prisma`, `.sql`, `.css`, `.yaml`, `.json`, or CI config files
- **Bidirectional parity:** Every VERIFY tag must have exactly one matching TRACED tag in source code

---

## Cross-Cutting Concerns

1. **Multi-tenancy:** All data access is scoped by tenantId via service-layer filtering and PostgreSQL RLS
2. **Global providers:** APP_GUARD (ThrottlerGuard, JwtAuthGuard), APP_FILTER (GlobalExceptionFilter), APP_INTERCEPTOR (ResponseTimeInterceptor) registered in AppModule
3. **Shared package:** 8+ exports consumed by both apps/api and apps/web with zero dead exports
4. **Environment-driven config:** All secrets from env vars, validated at startup, no hardcoded fallbacks
5. **Observability:** Structured logging with correlation IDs propagated through the full request lifecycle
