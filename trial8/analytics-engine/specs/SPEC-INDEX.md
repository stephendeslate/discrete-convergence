# Specification Index

> **Project:** Analytics Engine
> **Methodology:** CED v0.9-dc (Convergent Engineering Document)
> **Total VERIFY Tags:** 40
> **Total Spec Files:** 8

---

## Spec Files

| File | Category | Tags | Description |
|------|----------|------|-------------|
| [authentication.md](authentication.md) | AUTH | AE-AUTH-001–005 | JWT authentication, bcrypt hashing, RBAC guards, refresh tokens |
| [data-model.md](data-model.md) | DATA | AE-DATA-001–008 | Prisma schema, entities, RLS policies, cascade rules |
| [api-endpoints.md](api-endpoints.md) | API | AE-API-001–006 | REST endpoints, pagination, DTOs, controller structure |
| [frontend.md](frontend.md) | FE | AE-FE-001–005 | Next.js App Router, components, loading/error states, server actions |
| [infrastructure.md](infrastructure.md) | INFRA | AE-INFRA-001–004 | Docker, Compose, CI pipeline, environment validation |
| [security.md](security.md) | SEC | AE-SEC-001–004 | Helmet CSP, throttling, CORS, ValidationPipe |
| [monitoring.md](monitoring.md) | MON | AE-MON-001–005 | Pino logging, correlation IDs, health endpoints, exception filter |
| [cross-layer.md](cross-layer.md) | CROSS | AE-CROSS-001–004 | Global providers, shared exports, integration tests, tag parity |

---

## Tag Inventory

### Authentication (AUTH)

| Tag | Requirement |
|-----|-------------|
| AE-AUTH-001 | Bcrypt password hashing with BCRYPT_SALT_ROUNDS from shared |
| AE-AUTH-002 | JWT access + refresh token generation via NestJS JwtService |
| AE-AUTH-003 | Passport JWT strategy with secretOrKey from JWT_SECRET |
| AE-AUTH-004 | @Public() decorator bypasses JwtAuthGuard for decorated routes |
| AE-AUTH-005 | RBAC with @Roles() decorator and RolesGuard checking user.role |

### Data Model (DATA)

| Tag | Requirement |
|-----|-------------|
| AE-DATA-001 | Prisma schema with 5 entities, all @@map to snake_case tables |
| AE-DATA-002 | DataSource CRUD with tenant-scoped queries |
| AE-DATA-003 | Widget CRUD nested under dashboards with findFirst |
| AE-DATA-004 | Dashboard status enum (DRAFT, PUBLISHED, ARCHIVED) |
| AE-DATA-005 | Row Level Security with ENABLE, FORCE, CREATE POLICY |
| AE-DATA-006 | Cascade delete: widgets deleted when dashboard removed |
| AE-DATA-007 | DataSource type enum (POSTGRES, API, CSV) |
| AE-DATA-008 | Prisma migration with RLS policies in raw SQL |

### API Endpoints (API)

| Tag | Requirement |
|-----|-------------|
| AE-API-001 | Dashboard CRUD controller with pagination and auth guards |
| AE-API-002 | Widget CRUD nested under /dashboards/:dashboardId/widgets |
| AE-API-003 | DataSource CRUD with ADMIN-only delete |
| AE-API-004 | Paginated responses with clampPagination from shared |
| AE-API-005 | Auth endpoints: POST /auth/login, POST /auth/register, POST /auth/refresh |
| AE-API-006 | All POST/PUT/PATCH endpoints use class-validator DTOs |

### Frontend (FE)

| Tag | Requirement |
|-----|-------------|
| AE-FE-001 | Next.js App Router with 8 shadcn/ui components and APP_VERSION |
| AE-FE-002 | Loading states with role="status" and aria-busy="true" |
| AE-FE-003 | Error boundaries with role="alert" and focus management |
| AE-FE-004 | Dark mode via CSS media query, not JavaScript class toggling |
| AE-FE-005 | Server actions with cookie-based JWT auth |

### Infrastructure (INFRA)

| Tag | Requirement |
|-----|-------------|
| AE-INFRA-001 | Docker multi-stage build: deps, build, production stages |
| AE-INFRA-002 | Docker Compose with PostgreSQL 16 and pgdata volume |
| AE-INFRA-003 | GitHub Actions CI with lint, typecheck, build, test, audit |
| AE-INFRA-004 | validateEnvVars() at startup with process.exit(1) on failure |

### Security (SEC)

| Tag | Requirement |
|-----|-------------|
| AE-SEC-001 | Helmet CSP with restrictive directives |
| AE-SEC-002 | ThrottlerModule with default (100/60s) and auth (5/60s) configs |
| AE-SEC-003 | CORS from CORS_ORIGIN env var with no hardcoded fallback |
| AE-SEC-004 | ValidationPipe with whitelist, forbidNonWhitelisted, transform |

### Monitoring (MON)

| Tag | Requirement |
|-----|-------------|
| AE-MON-001 | Pino structured logging with formatLogEntry from shared |
| AE-MON-002 | Correlation ID middleware with createCorrelationId from shared |
| AE-MON-003 | Health and readiness endpoints with @Public() and @SkipThrottle() |
| AE-MON-004 | GlobalExceptionFilter with sanitizeLogContext from shared |
| AE-MON-005 | ResponseTimeInterceptor with X-Response-Time header |

### Cross-Layer (CROSS)

| Tag | Requirement |
|-----|-------------|
| AE-CROSS-001 | Global provider chain: 3 guards, 1 filter, 1 interceptor |
| AE-CROSS-002 | Shared package exports 10 consumed symbols |
| AE-CROSS-003 | Integration tests verify full request pipeline |
| AE-CROSS-004 | VERIFY/TRACED tag parity with >=35 tags, <=2 orphans |

---

## Traceability Summary

- **VERIFY tags in specs:** 40
- **TRACED tags in source:** 40
- **Orphan tags:** 0
- **Tag files:** TRACED tags appear only in `.ts` and `.tsx` files
