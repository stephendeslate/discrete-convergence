# Analytics Engine — Specification Index

## Overview

This document indexes all specification files for the Analytics Engine project.
The Analytics Engine is a multi-tenant embeddable analytics platform built with
NestJS 11, Next.js 15, Prisma 6, and PostgreSQL 16.

## Specification Files

| File | Layer | Description |
|------|-------|-------------|
| [authentication.md](authentication.md) | L0, L6 | JWT auth, bcrypt, role validation |
| [data-model.md](data-model.md) | L0, L4 | Prisma schema, entities, indexes, RLS |
| [api-endpoints.md](api-endpoints.md) | L0, L1 | REST API endpoints, pagination, errors |
| [frontend.md](frontend.md) | L2 | Next.js routes, shadcn/ui, accessibility |
| [security.md](security.md) | L6 | CSP, CORS, throttling, validation, RLS |
| [monitoring.md](monitoring.md) | L7, L8 | Health, metrics, logging, correlation |
| [infrastructure.md](infrastructure.md) | L4, L5 | Docker, CI/CD, monorepo, shared package |
| [cross-layer.md](cross-layer.md) | L9 | Integration testing, provider chain |

## VERIFY Tag Registry

All VERIFY tags use the `AE-` prefix.

### Authentication (AE-AUTH-*)
- AE-AUTH-001: Registration role validation
- AE-AUTH-002: bcrypt with shared salt rounds
- AE-AUTH-003: Auth routes with @Public()

### Data Model (AE-DATA-*)
- AE-DATA-001: Prisma service lifecycle
- AE-DATA-002: @@map naming conventions
- AE-DATA-003: Decimal for monetary fields
- AE-DATA-004: Database indexes

### API Endpoints (AE-DASH-*, AE-WIDG-*, AE-DS-*)
- AE-DASH-001: Dashboard CRUD + publish/archive
- AE-DASH-002: Dashboard Cache-Control
- AE-WIDG-001: Widget CRUD + position
- AE-WIDG-002: Widget Cache-Control
- AE-DS-001: DataSource CRUD + sync
- AE-DS-002: $executeRaw usage
- AE-DS-003: DataSource Cache-Control

### Frontend (AE-UI-*, AE-AX-*)
- AE-UI-001: Dark mode via prefers-color-scheme
- AE-UI-002: cn() with clsx + tailwind-merge
- AE-UI-003: Server actions checking response.ok
- AE-UI-004: Nav in root layout
- AE-AX-001: Loading states with role="status"
- AE-AX-002: Error states with role="alert" + focus
- AE-AX-003: jest-axe accessibility tests
- AE-AX-004: Keyboard navigation tests

### Security (AE-SEC-*)
- AE-SEC-001: JWT strategy no secret fallback
- AE-SEC-002: JwtAuthGuard as APP_GUARD
- AE-SEC-003: ThrottlerModule named configs
- AE-SEC-004: Env validation at startup
- AE-SEC-005: Helmet CSP directives
- AE-SEC-006: CORS configuration
- AE-SEC-007: ValidationPipe options

### Monitoring (AE-MON-*)
- AE-MON-001: Public + skip-throttle health
- AE-MON-002: Health with APP_VERSION + $queryRaw
- AE-MON-003: Pino structured logger
- AE-MON-004: Request-scoped context
- AE-MON-005: Correlation ID middleware
- AE-MON-006: Request logging middleware
- AE-MON-007: Global exception filter

### Performance (AE-PERF-*)
- AE-PERF-001: Response time interceptor
- AE-PERF-002: Pagination clamping

### Infrastructure (AE-INFRA-*, AE-ARCH-*)
- AE-INFRA-001: Seed with error handling
- AE-INFRA-002: Multi-stage Dockerfile
- AE-ARCH-001: AppModule global providers

### Testing (AE-TEST-*)
- AE-TEST-001: Auth integration tests
- AE-TEST-002: Dashboard integration tests
- AE-TEST-003: Cross-layer integration test
- AE-TEST-004: Monitoring integration tests
- AE-TEST-005: Security integration tests
- AE-TEST-006: Performance integration tests
- AE-TEST-007: Dashboard service unit test
- AE-TEST-008: DataSource service unit test

## Cross-References

- authentication.md references security.md
- data-model.md references security.md
- api-endpoints.md references monitoring.md
- monitoring.md references cross-layer.md and api-endpoints.md
