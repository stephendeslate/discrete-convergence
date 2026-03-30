# Specification Index — Fleet Dispatch

> **Project:** Fleet Dispatch
> **Tag Prefix:** FD-
> **Total VERIFY Tags:** 56

---

## Spec Files

| File | Category | Tags | Description |
|------|----------|------|-------------|
| [auth.md](auth.md) | AUTH | FD-AUTH-001..005 | JWT authentication, bcrypt, registration DTO, public decorator |
| [authentication.md](authentication.md) | AUTH | FD-AUTH-001..005,010..011 | JWT authentication, bcrypt, registration DTO, public decorator, auth utilities |
| [data-model.md](data-model.md) | DATA | FD-DM-001..005 | Prisma schema, state machines, RLS, monetary fields |
| [api-layer.md](api-layer.md) | API | FD-API-001..005 | Controllers, DTOs, CRUD, status transitions |
| [api-endpoints.md](api-endpoints.md) | API | FD-API-001..005 | Controllers, DTOs, CRUD, status transitions |
| [frontend.md](frontend.md) | FE | FD-FE-001..006 | Next.js, shadcn/ui, accessibility, keyboard, server actions |
| [infrastructure.md](infrastructure.md) | INFRA | FD-INF-001..005 | Dockerfile, CI, seed, env validation, shared package |
| [security.md](security.md) | SEC | FD-SEC-001..006 | Helmet, throttler, CORS, validation, security tests |
| [monitoring.md](monitoring.md) | MON | FD-MON-001..008 | Pino, correlation IDs, health, metrics, exception filter |
| [performance.md](performance.md) | PERF | FD-PERF-001..003,010 | Response time, pagination, Cache-Control, pagination decorator |
| [cross-layer.md](cross-layer.md) | CROSS | FD-CL-001..004, FD-TEST-001..006 | Provider chain, integration tests |

---

## Full Tag Registry

### Authentication (FD-AUTH)
- VERIFY:FD-AUTH-001 — JWT + bcrypt authentication service
- VERIFY:FD-AUTH-002 — bcrypt password hashing with shared BCRYPT_SALT_ROUNDS
- VERIFY:FD-AUTH-003 — Auth controller with @Public() decorator
- VERIFY:FD-AUTH-004 — Registration DTO with ALLOWED_REGISTRATION_ROLES
- VERIFY:FD-AUTH-005 — JWT strategy extracting Bearer token
- VERIFY:FD-AUTH-010 — Shared helper to extract companyId from authenticated request
- VERIFY:FD-AUTH-011 — @CompanyId() parameter decorator extracts tenant ID from JWT

### Data Model (FD-DM)
- VERIFY:FD-DM-001 — Prisma schema with @@map on all models and enums
- VERIFY:FD-DM-002 — Work order 9-state machine
- VERIFY:FD-DM-003 — Invoice state machine (DRAFT → SENT → PAID, VOID)
- VERIFY:FD-DM-004 — Decimal(12,2) monetary fields
- VERIFY:FD-DM-005 — RLS enforcement via $executeRaw

### API Layer (FD-API)
- VERIFY:FD-API-001 — RESTful controller with standard HTTP methods
- VERIFY:FD-API-002 — Work orders controller with CRUD + status transitions
- VERIFY:FD-API-003 — Work order DTO with class-validator decorators
- VERIFY:FD-API-004 — Technicians CRUD service with GPS position updates
- VERIFY:FD-API-005 — Invoices controller with CRUD + status transitions

### Frontend (FD-FE)
- VERIFY:FD-FE-001 — cn() utility with clsx + tailwind-merge
- VERIFY:FD-FE-002 — Button component following shadcn/ui patterns
- VERIFY:FD-FE-003 — Accessibility tests for ARIA attributes
- VERIFY:FD-FE-004 — Keyboard navigation tests
- VERIFY:FD-FE-005 — Root layout with navigation and APP_VERSION
- VERIFY:FD-FE-006 — Server actions for form submissions

### Infrastructure (FD-INF)
- VERIFY:FD-INF-001 — Seed with BCRYPT_SALT_ROUNDS, error handling
- VERIFY:FD-INF-002 — Docker multi-stage build
- VERIFY:FD-INF-003 — Environment validation at startup
- VERIFY:FD-INF-004 — CI pipeline via GitHub Actions
- VERIFY:FD-INF-005 — Shared package exports consumed via workspace:*

### Security (FD-SEC)
- VERIFY:FD-SEC-001 — Helmet CSP configuration
- VERIFY:FD-SEC-002 — ThrottlerModule with named configs
- VERIFY:FD-SEC-003 — Global JwtAuthGuard with @Public() bypass
- VERIFY:FD-SEC-004 — Global validation pipe
- VERIFY:FD-SEC-005 — CORS configuration from environment
- VERIFY:FD-SEC-006 — Security integration tests

### Monitoring (FD-MON)
- VERIFY:FD-MON-001 — Pino structured JSON logger
- VERIFY:FD-MON-002 — CorrelationIdMiddleware
- VERIFY:FD-MON-003 — RequestContextService (request-scoped)
- VERIFY:FD-MON-004 — RequestLoggingMiddleware
- VERIFY:FD-MON-005 — GlobalExceptionFilter as APP_FILTER
- VERIFY:FD-MON-006 — Health endpoints
- VERIFY:FD-MON-007 — In-memory metrics
- VERIFY:FD-MON-008 — Metrics endpoint

### Performance (FD-PERF)
- VERIFY:FD-PERF-001 — ResponseTimeInterceptor as APP_INTERCEPTOR
- VERIFY:FD-PERF-002 — Performance tests
- VERIFY:FD-PERF-003 — Pagination with clampPagination
- VERIFY:FD-PERF-010 — @PaginationParams() decorator extracts page/pageSize from query string

### Cross-Layer / Testing (FD-CL, FD-TEST)
- VERIFY:FD-CL-001 — JwtAuthGuard as APP_GUARD
- VERIFY:FD-CL-002 — @Public() decorator
- VERIFY:FD-CL-003 — AppModule provider chain
- VERIFY:FD-CL-004 — Cross-layer integration tests
- VERIFY:FD-TEST-001 — Auth service unit tests
- VERIFY:FD-TEST-002 — Work orders service unit tests
- VERIFY:FD-TEST-003 — Technicians service unit tests
- VERIFY:FD-TEST-004 — Auth integration tests
- VERIFY:FD-TEST-005 — Work orders integration tests
- VERIFY:FD-TEST-006 — Monitoring tests
