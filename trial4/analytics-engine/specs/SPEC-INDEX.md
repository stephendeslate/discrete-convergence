# Specification Index — Analytics Engine

## Overview

This index catalogs all specification documents for the Analytics Engine project.
The Analytics Engine is a multi-tenant embeddable analytics platform for SaaS companies.

## Specification Documents

| # | Document | Description | VERIFY Tags |
|---|----------|-------------|-------------|
| 1 | [authentication.md](authentication.md) | JWT auth, bcrypt hashing, registration rules | AE-SEC-001 to AE-SEC-004 |
| 2 | [data-model.md](data-model.md) | Entity relationships, indexing, RLS, enum mapping | AE-DAT-001 to AE-DAT-006 |
| 3 | [api-endpoints.md](api-endpoints.md) | CRUD endpoints, pagination, error format | AE-API-001 to AE-API-004 |
| 4 | [frontend.md](frontend.md) | Next.js UI, shadcn/ui, loading/error states | AE-FE-001 to AE-FE-006 |
| 5 | [security.md](security.md) | Helmet CSP, throttling, CORS, validation | AE-SEC-005 to AE-SEC-009 |
| 6 | [monitoring.md](monitoring.md) | Logging, correlation IDs, health, metrics | AE-MON-001 to AE-MON-006 |
| 7 | [infrastructure.md](infrastructure.md) | Docker, CI/CD, seed, shared package | AE-INF-001 to AE-INF-005 |
| 8 | [cross-layer.md](cross-layer.md) | Provider chain, integration, testing | AE-CRS-001 to AE-CRS-002, AE-PRF-001 to AE-PRF-004, AE-TST-001 to AE-TST-010 |

## Tag Prefix

All VERIFY/TRACED tags use the **AE-** prefix:
- AE-SEC: Security and authentication
- AE-DAT: Data model and schema
- AE-API: API endpoints
- AE-FE: Frontend
- AE-MON: Monitoring
- AE-INF: Infrastructure
- AE-CRS: Cross-layer integration
- AE-PRF: Performance
- AE-TST: Testing

## VERIFY Tag Registry

### Authentication (authentication.md)
- VERIFY:AE-SEC-001 — BCRYPT_SALT_ROUNDS from shared
- VERIFY:AE-SEC-002 — JWT secret no hardcoded fallback
- VERIFY:AE-SEC-003 — ALLOWED_REGISTRATION_ROLES excludes ADMIN
- VERIFY:AE-SEC-004 — JwtAuthGuard as APP_GUARD

### Data Model (data-model.md)
- VERIFY:AE-DAT-001 — @@map on all models and enums
- VERIFY:AE-DAT-002 — @@index on tenantId, status, composites
- VERIFY:AE-DAT-003 — Widget count cap from shared
- VERIFY:AE-DAT-004 — RLS on all tenant tables
- VERIFY:AE-DAT-005 — configEncrypted never exposed
- VERIFY:AE-DAT-006 — $executeRaw with Prisma.sql

### API Endpoints (api-endpoints.md)
- VERIFY:AE-API-001 — Auth endpoints @Public()
- VERIFY:AE-API-002 — Dashboard CRUD tenant-scoped
- VERIFY:AE-API-003 — Widget ownership validation
- VERIFY:AE-API-004 — Data source CRUD with sync history

### Frontend (frontend.md)
- VERIFY:AE-FE-001 — cn() with clsx + tailwind-merge
- VERIFY:AE-FE-002 — Server Actions check response.ok
- VERIFY:AE-FE-003 — Dark mode via @media prefers-color-scheme
- VERIFY:AE-FE-004 — Root layout with Nav
- VERIFY:AE-FE-005 — error.tsx with role="alert" + useRef + focus
- VERIFY:AE-FE-006 — next/dynamic code splitting

### Security (security.md)
- VERIFY:AE-SEC-005 — ThrottlerModule named configs
- VERIFY:AE-SEC-006 — validateEnvVars at startup
- VERIFY:AE-SEC-007 — Helmet CSP directives
- VERIFY:AE-SEC-008 — CORS from env, no fallback
- VERIFY:AE-SEC-009 — ValidationPipe whitelist + forbid + transform

### Monitoring (monitoring.md)
- VERIFY:AE-MON-001 — CorrelationId from shared
- VERIFY:AE-MON-002 — RequestLogging with formatLogEntry
- VERIFY:AE-MON-003 — GlobalExceptionFilter sanitization
- VERIFY:AE-MON-004 — RequestContextService request-scoped
- VERIFY:AE-MON-005 — Health with APP_VERSION
- VERIFY:AE-MON-006 — health/ready with $queryRaw

### Infrastructure (infrastructure.md)
- VERIFY:AE-INF-001 — Dockerfile multi-stage
- VERIFY:AE-INF-002 — Seed with BCRYPT_SALT_ROUNDS from shared
- VERIFY:AE-INF-003 — CI/CD lint+test+build+typecheck+migrate+audit
- VERIFY:AE-INF-004 — turbo in root devDependencies
- VERIFY:AE-INF-005 — Shared >= 8 consumed exports

### Cross-Layer (cross-layer.md)
- VERIFY:AE-CRS-001 — Provider chain in AppModule
- VERIFY:AE-CRS-002 — Cross-layer integration test
- VERIFY:AE-PRF-001 — ResponseTimeInterceptor APP_INTERCEPTOR
- VERIFY:AE-PRF-002 — Pagination clamping
- VERIFY:AE-PRF-003 — Cache-Control on list endpoints
- VERIFY:AE-PRF-004 — Data source Cache-Control

### Testing (cross-layer.md)
- VERIFY:AE-TST-001 — Auth integration supertest
- VERIFY:AE-TST-002 — Dashboard integration supertest
- VERIFY:AE-TST-003 — Dashboard unit mocked Prisma
- VERIFY:AE-TST-004 — Data source unit mocked Prisma
- VERIFY:AE-TST-005 — Auth unit BCRYPT_SALT_ROUNDS from shared
- VERIFY:AE-TST-006 — Monitoring supertest integration
- VERIFY:AE-TST-007 — Security supertest integration
- VERIFY:AE-TST-008 — Performance supertest integration
- VERIFY:AE-TST-009 — Accessibility jest-axe
- VERIFY:AE-TST-010 — Keyboard userEvent
