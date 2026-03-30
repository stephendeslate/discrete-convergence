# Analytics Engine — Specification Index

## Project Overview

The Analytics Engine is a multi-tenant analytics dashboard platform built with NestJS (backend), Next.js (frontend), and PostgreSQL. It enables organizations to create dashboards, connect data sources, and visualize metrics through configurable widgets.

## Architecture Summary

- **Backend:** NestJS 11 API with Prisma ORM, JWT authentication, RBAC, tenant isolation
- **Frontend:** Next.js 15 with App Router, shadcn/ui components, server actions
- **Shared:** TypeScript package with constants, validators, sanitizers, pagination
- **Infrastructure:** Docker multi-stage builds, PostgreSQL 16, Turborepo monorepo

## Specification Files

| File | Domain | VERIFY Range | Status |
|------|--------|-------------|--------|
| [authentication.md](authentication.md) | Auth, JWT, RBAC | AE-AUTH-001 to AE-AUTH-005 | Complete |
| [data-model.md](data-model.md) | Prisma, Schema, RLS | AE-DATA-001 to AE-DATA-006 | Complete |
| [api-endpoints.md](api-endpoints.md) | Controllers, CRUD | AE-API-001 to AE-API-007 | Complete |
| [frontend.md](frontend.md) | Next.js, UI, a11y | AE-FE-001 to AE-FE-008 | Complete |
| [infrastructure.md](infrastructure.md) | Docker, CI, Seed | AE-INFRA-001 to AE-INFRA-003 | Complete |
| [security.md](security.md) | Guards, CSP, CORS | AE-SEC-001 to AE-SEC-006 | Complete |
| [monitoring.md](monitoring.md) | Health, Logs, Metrics | AE-MON-001 to AE-MON-006 | Complete |
| [cross-layer.md](cross-layer.md) | Integration, Pipeline | AE-CROSS-001 to AE-CROSS-004 | Complete |
| [performance.md](performance.md) | Pagination, Cache | AE-PERF-001 to AE-PERF-003 | Complete |
| [edge-cases.md](edge-cases.md) | Boundary, Error, Defense | AE-EDGE-001 to AE-EDGE-014 | Complete |

## Traceability Matrix

Total VERIFY tags: 62 (across 10 spec documents)
Total TRACED tags: 62 (in .ts/.tsx source files only)
Orphan count: 0
Bidirectional parity: 100%

### Tag Distribution

| Prefix | Count | Source Files |
|--------|-------|-------------|
| AE-AUTH | 5 | auth.module.ts, auth.service.ts, jwt.strategy.ts, register.dto.ts, jwt-auth.guard.ts, auth.controller.ts |
| AE-API | 7 | dashboard.service.ts, dashboard.controller.ts, widget.service.ts, widget.controller.ts, data-source.service.ts, data-source.controller.ts, auth.controller.ts |
| AE-DATA | 6 | prisma.service.ts |
| AE-FE | 8 | layout.tsx, login/page.tsx, dashboard/page.tsx, error.tsx, actions.ts, utils.ts, nav.tsx |
| AE-SEC | 6 | main.ts, roles.guard.ts, global-exception.filter.ts |
| AE-MON | 6 | monitoring.service.ts, monitoring.controller.ts, correlation-id.middleware.ts, request-logging.middleware.ts, correlation.ts, log-format.ts, log-sanitizer.ts |
| AE-INFRA | 3 | monitoring.controller.ts, seed.ts, env-validation.ts |
| AE-CROSS | 4 | app.module.ts, actions.ts, cross-layer.integration.spec.ts, shared/index.ts |
| AE-PERF | 3 | response-time.interceptor.ts, dashboard.controller.ts, dashboard.service.ts |
| AE-EDGE | 14 | register.dto.ts, auth.service.ts, dashboard.service.ts, jwt-auth.guard.ts, global-exception.filter.ts, monitoring.controller.ts, pagination.ts |

## Cross-Cutting Concerns

- **Tenant Isolation:** All domain queries filter by tenantId from JWT payload
- **Error Handling:** GlobalExceptionFilter sanitizes errors, includes correlationId
- **Logging:** Pino structured JSON with correlation IDs and request context
- **Validation:** class-validator on all DTOs with whitelist and forbidNonWhitelisted
- **Rate Limiting:** ThrottlerModule with default and auth-specific configurations

## Dependency Notes

- bcryptjs (pure JS) used instead of bcrypt to avoid native dependency vulnerabilities
- Prisma pinned to >=6.0.0 <7.0.0 range for schema stability
- pnpm.overrides for effect>=3.20.0 to fix Prisma transitive vulnerability
- ESLint 9 with flat config format (eslint.config.mjs)

## Build and Test Commands

- `pnpm install` — Install all dependencies
- `pnpm turbo run build` — Build all packages
- `pnpm turbo run test` — Run all tests
- `pnpm turbo run lint` — Run linting
- `pnpm turbo run typecheck` — Run TypeScript checks
