# Event Management — Specification Index

> **Project:** Event Management
> **Trial:** 23 (discrete-convergence)
> **Spec Prefix:** EM-
> **Last Updated:** 2026-03-25

---

## Project Overview

The Event Management platform is a multi-tenant event management system built with NestJS 11, Prisma 6, Next.js 15, React 19, and Tailwind CSS 4. The monorepo is managed with Turborepo and pnpm workspaces, organized into `apps/api` (NestJS backend), `apps/web` (Next.js frontend), and `packages/shared` (shared TypeScript utilities).

---

## Specification Documents

| # | Document | Domain | VERIFY Tags | Description |
|---|----------|--------|-------------|-------------|
| 1 | [authentication.md](authentication.md) | AUTH | EM-AUTH-001 – EM-AUTH-005 | JWT auth, bcrypt, registration, guards, rate limiting |
| 2 | [data-model.md](data-model.md) | DATA | EM-DATA-001 – EM-DATA-006 | Prisma schema, indexes, RLS, enums, sync history |
| 3 | [api-endpoints.md](api-endpoints.md) | API | EM-API-001 – EM-API-006 | REST CRUD, pagination, tenant scoping, dashboards, data sources |
| 4 | [frontend.md](frontend.md) | FE | EM-FE-001 – EM-FE-004 | Next.js app, cookies, server actions, accessibility |
| 5 | [infrastructure.md](infrastructure.md) | INFRA | EM-INFRA-001 – EM-INFRA-004 | Docker, CI/CD, env validation |
| 6 | [security.md](security.md) | SEC | EM-SEC-001 – EM-SEC-005 | Helmet, throttling, CORS, validation, secrets |
| 7 | [monitoring.md](monitoring.md) | MON | EM-MON-001 – EM-MON-004 | Pino logging, correlation IDs, health, exception filter |
| 8 | [cross-layer.md](cross-layer.md) | CROSS | EM-CROSS-001 – EM-CROSS-003 | Global providers, interceptors, shared package |
| 9 | [edge-cases.md](edge-cases.md) | EDGE | EM-EDGE-001 – EM-EDGE-010 | Boundary, error, and failure handling |

---

## Traceability Matrix

| VERIFY Tag | Domain | Spec File | Summary |
|------------|--------|-----------|---------|
| EM-AUTH-001 | AUTH | authentication.md | JWT login with bcryptjs + BCRYPT_SALT_ROUNDS |
| EM-AUTH-002 | AUTH | authentication.md | Registration role restriction (ADMIN excluded) |
| EM-AUTH-003 | AUTH | authentication.md | Refresh token validation and reissuance |
| EM-AUTH-004 | AUTH | authentication.md | Global JwtAuthGuard as APP_GUARD |
| EM-AUTH-005 | AUTH | authentication.md | Login rate limiting via @Throttle |
| EM-DATA-001 | DATA | data-model.md | Prisma @@map('snake_case') on all models |
| EM-DATA-002 | DATA | data-model.md | Decimal @db.Decimal(12,2) for monetary fields |
| EM-DATA-003 | DATA | data-model.md | Indexes on organizationId, status, composites |
| EM-DATA-004 | DATA | data-model.md | RLS ENABLE + FORCE + CREATE POLICY |
| EM-DATA-005 | DATA | data-model.md | User email unique constraint |
| EM-DATA-006 | DATA | data-model.md | SyncHistory tracks FAILED status with errorMessage |
| EM-API-001 | API | api-endpoints.md | Event CRUD with organization scoping |
| EM-API-002 | API | api-endpoints.md | Venue CRUD with organization scoping |
| EM-API-003 | API | api-endpoints.md | Registration management with event scoping |
| EM-API-004 | API | api-endpoints.md | Pagination via clampPagination (MAX_PAGE_SIZE=100) |
| EM-API-005 | API | api-endpoints.md | Dashboard CRUD with organization scoping |
| EM-API-006 | API | api-endpoints.md | DataSource CRUD with sync and history |
| EM-FE-001 | FE | frontend.md | Token in httpOnly cookie |
| EM-FE-002 | FE | frontend.md | Server actions with Authorization bearer header |
| EM-FE-003 | FE | frontend.md | loading.tsx with role="status" aria-busy="true" |
| EM-FE-004 | FE | frontend.md | error.tsx with role="alert" and focus management |
| EM-INFRA-001 | INFRA | infrastructure.md | Multi-stage Dockerfile, prisma generate before tsc |
| EM-INFRA-002 | INFRA | infrastructure.md | docker-compose PostgreSQL 16 healthcheck |
| EM-INFRA-003 | INFRA | infrastructure.md | CI: lint + test + build + typecheck + audit |
| EM-INFRA-004 | INFRA | infrastructure.md | validateEnvVars at startup |
| EM-SEC-001 | SEC | security.md | Helmet CSP default-src self, frame-ancestors none |
| EM-SEC-002 | SEC | security.md | ThrottlerModule limit >= 20000 |
| EM-SEC-003 | SEC | security.md | CORS from CORS_ORIGIN env, credentials true |
| EM-SEC-004 | SEC | security.md | ValidationPipe whitelist + forbidNonWhitelisted |
| EM-SEC-005 | SEC | security.md | No hardcoded secret fallbacks |
| EM-MON-001 | MON | monitoring.md | Pino JSON logging, pino-pretty in development |
| EM-MON-002 | MON | monitoring.md | CorrelationIdMiddleware reads X-Correlation-ID |
| EM-MON-003 | MON | monitoring.md | Health returns status, timestamp, uptime, version |
| EM-MON-004 | MON | monitoring.md | GlobalExceptionFilter sanitizes via sanitizeLogContext |
| EM-CROSS-001 | CROSS | cross-layer.md | APP_GUARD + APP_FILTER + APP_INTERCEPTOR in AppModule |
| EM-CROSS-002 | CROSS | cross-layer.md | ResponseTimeInterceptor X-Response-Time header |
| EM-CROSS-003 | CROSS | cross-layer.md | Shared package >= 3 consumers per app |
| EM-EDGE-001 | EDGE | edge-cases.md | Duplicate email → 409 Conflict |
| EM-EDGE-002 | EDGE | edge-cases.md | Invalid JWT → 401 Unauthorized |
| EM-EDGE-003 | EDGE | edge-cases.md | Event not found → 404 |
| EM-EDGE-004 | EDGE | edge-cases.md | Malformed body → 400 Bad Request |
| EM-EDGE-005 | EDGE | edge-cases.md | Null pagination → DEFAULT_PAGE_SIZE boundary |
| EM-EDGE-006 | EDGE | edge-cases.md | Overflow page size → MAX_PAGE_SIZE boundary |
| EM-EDGE-007 | EDGE | edge-cases.md | Forbidden ADMIN role → 403 |
| EM-EDGE-008 | EDGE | edge-cases.md | Registration for invalid event → 404 |
| EM-EDGE-009 | EDGE | edge-cases.md | Registration error → proper error message |
| EM-EDGE-010 | EDGE | edge-cases.md | No token → 401 Unauthorized |

**Total VERIFY tags: 47**

---

## Tag Convention

- **Prefix:** `EM-` (Event Management)
- **Format:** VERIFY tags in spec files, TRACED tags in .ts/.tsx source files only
- **TRACED restriction:** TRACED tags appear ONLY in `.ts` and `.tsx` files — never in `.prisma`, `.sql`, `.css`, `.yaml`, `.json`, or CI config files
- **Bidirectional parity:** Every VERIFY tag must have exactly one matching TRACED tag in source code

---

## Cross-Cutting Concerns

1. **Multi-tenancy:** All data access is scoped by organizationId via service-layer filtering and PostgreSQL RLS
2. **Global providers:** APP_GUARD (ThrottlerGuard, JwtAuthGuard, RolesGuard), APP_FILTER (GlobalExceptionFilter), APP_INTERCEPTOR (ResponseTimeInterceptor) registered in AppModule
3. **Shared package:** 10+ exports consumed by both apps/api and apps/web with zero dead exports
4. **Environment-driven config:** All secrets from env vars, validated at startup, no hardcoded fallbacks
5. **Observability:** Structured logging with correlation IDs propagated through the full request lifecycle
