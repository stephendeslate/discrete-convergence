# Event Management — Specification Index

## Project: Event Management Platform
## Trial: 3 (discrete-convergence)
## Domain: Multi-tenant event management with registration, ticketing, and check-in
## VERIFY/TRACED Prefix: EM-

---

## Specification Documents

| # | Document | Purpose | VERIFY Tags |
|---|----------|---------|-------------|
| 1 | [authentication.md](authentication.md) | JWT auth, bcrypt hashing, multi-tenant login | EM-AUTH-001 through EM-AUTH-005 |
| 2 | [data-model.md](data-model.md) | Prisma schema, entities, indexes, RLS | EM-DATA-001, EM-DATA-002 |
| 3 | [api-endpoints.md](api-endpoints.md) | REST endpoints, controllers, services | EM-EVT-001/002, EM-VEN-001/002, EM-REG-001/002, EM-CHK-001/002, EM-NOT-001/002 |
| 4 | [frontend.md](frontend.md) | Next.js pages, components, accessibility | EM-UI-001 through EM-UI-005 |
| 5 | [security.md](security.md) | Helmet, throttling, CORS, validation | EM-ARCH-001, EM-ARCH-002 |
| 6 | [monitoring.md](monitoring.md) | Logging, correlation, health, metrics | EM-MON-001 through EM-MON-007 |
| 7 | [infrastructure.md](infrastructure.md) | Docker, CI/CD, seed, monorepo | EM-INFRA-001 through EM-INFRA-003 |
| 8 | [cross-layer.md](cross-layer.md) | Integration, regression, shared package | EM-CROSS-001, EM-PERF-001/002, EM-AX-001/002 |

---

## VERIFY Tag Registry

### Authentication (5 tags)
- VERIFY:EM-AUTH-001 — JWT payload structure
- VERIFY:EM-AUTH-002 — AuthService with BCRYPT_SALT_ROUNDS from shared
- VERIFY:EM-AUTH-003 — AuthController public endpoints
- VERIFY:EM-AUTH-004 — JwtStrategy token extraction
- VERIFY:EM-AUTH-005 — RegisterDto validation rules

### Data Model (2 tags)
- VERIFY:EM-DATA-001 — $executeRaw usage, zero $executeRawUnsafe
- VERIFY:EM-DATA-002 — RLS enabled in migrations

### API Endpoints (10 tags)
- VERIFY:EM-EVT-001 — EventService CRUD + publish + cancel
- VERIFY:EM-EVT-002 — EventController with Cache-Control
- VERIFY:EM-VEN-001 — VenueService CRUD with tenant scoping
- VERIFY:EM-VEN-002 — VenueController with Cache-Control
- VERIFY:EM-REG-001 — RegistrationService with transactions
- VERIFY:EM-REG-002 — RegistrationController event-scoped
- VERIFY:EM-CHK-001 — CheckInService idempotent check-in
- VERIFY:EM-CHK-002 — CheckInController endpoints
- VERIFY:EM-NOT-001 — NotificationService broadcast
- VERIFY:EM-NOT-002 — NotificationController endpoints

### Frontend (5 tags)
- VERIFY:EM-UI-001 — cn() utility with clsx + tailwind-merge
- VERIFY:EM-UI-002 — Server Actions with 'use server'
- VERIFY:EM-UI-003 — Nav component with aria-label
- VERIFY:EM-UI-004 — Root layout with Nav
- VERIFY:EM-UI-005 — Settings page with APP_VERSION

### Security (2 tags)
- VERIFY:EM-ARCH-001 — AppModule global providers
- VERIFY:EM-ARCH-002 — main.ts security configuration

### Monitoring (7 tags)
- VERIFY:EM-MON-001 — PinoLoggerService
- VERIFY:EM-MON-002 — RequestContextService (request-scoped)
- VERIFY:EM-MON-003 — CorrelationIdMiddleware
- VERIFY:EM-MON-004 — RequestLoggingMiddleware
- VERIFY:EM-MON-005 — GlobalExceptionFilter
- VERIFY:EM-MON-006 — MonitoringService health/metrics
- VERIFY:EM-MON-007 — MonitoringController endpoints

### Infrastructure (3 tags)
- VERIFY:EM-INFRA-001 — Seed script
- VERIFY:EM-INFRA-002 — Dockerfile multi-stage
- VERIFY:EM-INFRA-003 — CI workflow

### Cross-Layer (5 tags)
- VERIFY:EM-CROSS-001 — Cross-layer integration test
- VERIFY:EM-PERF-001 — Pagination clamping
- VERIFY:EM-PERF-002 — ResponseTimeInterceptor
- VERIFY:EM-AX-001 — Accessibility tests (jest-axe)
- VERIFY:EM-AX-002 — Keyboard navigation tests

---

## Total: 39 VERIFY tags
## Cross-references: authentication.md <-> security.md, authentication.md <-> api-endpoints.md, frontend.md <-> cross-layer.md, data-model.md <-> security.md, cross-layer.md <-> security.md
