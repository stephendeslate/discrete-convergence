# Event Management — Specification Index

## Project Overview

**Project:** Event Management
**Domain:** Multi-tenant event management platform
**Trial:** 2
**Methodology:** CED (Convergence Engineering Development)
**Tag Prefix:** EM-

## Specification Documents

| # | Document | Description | VERIFY Tags |
|---|----------|-------------|-------------|
| 1 | [authentication.md](authentication.md) | JWT auth, bcrypt, registration roles | EM-AUTH-001..003 |
| 2 | [data-model.md](data-model.md) | Prisma schema, indexes, RLS, status machines | EM-DATA-001..003 |
| 3 | [api-endpoints.md](api-endpoints.md) | REST endpoints, validation, pagination | EM-API-001..004 |
| 4 | [frontend.md](frontend.md) | Next.js, shadcn/ui, dark mode, server actions | EM-UI-001..006 |
| 5 | [infrastructure.md](infrastructure.md) | Docker, CI/CD, seed, Prisma pinning | EM-INFRA-001..003 |
| 6 | [security.md](security.md) | Helmet CSP, CORS, throttling, validation | EM-SEC-001..003 |
| 7 | [monitoring.md](monitoring.md) | Health, metrics, logging, error handling | EM-MON-001..007 |
| 8 | [cross-layer.md](cross-layer.md) | Integration, shared package, testing | EM-ARCH, EM-PERF, EM-EVT, EM-REG, EM-TEST, EM-AX |

## VERIFY Tag Registry

### Authentication (EM-AUTH)
- `EM-AUTH-001` — Registration DTO restricts roles via ALLOWED_REGISTRATION_ROLES
- `EM-AUTH-002` — Auth service uses BCRYPT_SALT_ROUNDS from shared
- `EM-AUTH-003` — JWT strategy extracts token from Bearer header

### Data Model (EM-DATA)
- `EM-DATA-001` — Event service uses $executeRaw for audit logging
- `EM-DATA-002` — Database indexes on tenantId, status, and composite keys
- `EM-DATA-003` — Migration includes ENABLE and FORCE ROW LEVEL SECURITY

### API (EM-API)
- `EM-API-001` — Auth endpoints (login, register, refresh) are public
- `EM-API-002` — Events CRUD with publish/cancel endpoints
- `EM-API-003` — Venue service with full CRUD operations
- `EM-API-004` — Registration endpoints for register, list, cancel

### Frontend (EM-UI)
- `EM-UI-001` — cn() utility uses clsx + tailwind-merge
- `EM-UI-002` — Server actions check response.ok before processing
- `EM-UI-003` — Nav component uses APP_VERSION from shared
- `EM-UI-004` — Root layout with Nav component
- `EM-UI-005` — Settings page uses APP_VERSION from shared
- `EM-UI-006` — Dark mode via @media (prefers-color-scheme: dark)

### Infrastructure (EM-INFRA)
- `EM-INFRA-001` — Seed uses BCRYPT_SALT_ROUNDS from shared, includes error state data
- `EM-INFRA-002` — CI pipeline with lint, test, build, typecheck, migration-check, audit
- `EM-INFRA-003` — Prisma pinned with >=6.0.0 <7.0.0 range

### Security (EM-SEC)
- `EM-SEC-001` — JwtAuthGuard as APP_GUARD with @Public() exemption
- `EM-SEC-002` — ThrottlerModule with default and auth named configs
- `EM-SEC-003` — main.ts validates env vars, configures Helmet CSP, CORS, ValidationPipe

### Monitoring (EM-MON)
- `EM-MON-001` — CorrelationIdMiddleware preserves or generates correlation ID
- `EM-MON-002` — RequestLoggingMiddleware logs method, URL, status, duration, correlationId
- `EM-MON-003` — GlobalExceptionFilter sanitizes errors, includes correlationId
- `EM-MON-004` — Health endpoints with @Public() and @SkipThrottle()
- `EM-MON-005` — Health returns APP_VERSION from shared
- `EM-MON-006` — /health/ready performs $queryRaw DB connectivity check
- `EM-MON-007` — Log sanitizer handles arrays recursively with case-insensitive matching

### Architecture (EM-ARCH)
- `EM-ARCH-001` — AppModule registers APP_GUARD, APP_FILTER, APP_INTERCEPTOR via DI

### Performance (EM-PERF)
- `EM-PERF-001` — ResponseTimeInterceptor adds X-Response-Time header
- `EM-PERF-002` — Pagination clamping uses shared clampPagination

### Events (EM-EVT)
- `EM-EVT-001` — Event service implements status machine transitions

### Registration (EM-REG)
- `EM-REG-001` — Registration service manages registration lifecycle
- `EM-REG-002` — Registration validates event is open before registering

### Testing (EM-TEST)
- `EM-TEST-001` — Auth integration tests with supertest
- `EM-TEST-002` — Event integration tests with supertest
- `EM-TEST-003` — Cross-layer integration tests verifying full pipeline
- `EM-TEST-004` — Monitoring integration tests with supertest
- `EM-TEST-005` — Security integration tests with supertest
- `EM-TEST-006` — Performance integration tests with supertest
- `EM-TEST-007` — Event service unit tests with mocked Prisma
- `EM-TEST-008` — Registration service unit tests with mocked Prisma
- `EM-TEST-009` — Log sanitizer tests with array cases

### Accessibility (EM-AX)
- `EM-AX-001` — Accessibility tests with jest-axe rendering real components
- `EM-AX-002` — Keyboard navigation tests with userEvent

## Cross-Reference Map

- authentication.md references: security.md, api-endpoints.md
- data-model.md references: api-endpoints.md, infrastructure.md
- security.md references: authentication.md, monitoring.md
- cross-layer.md references: authentication.md, monitoring.md, security.md

## Tag Statistics

- Total VERIFY tags: 37
- Tag prefix: EM-
- Categories: 11 (AUTH, DATA, API, UI, INFRA, SEC, MON, ARCH, PERF, EVT, REG, TEST, AX)
