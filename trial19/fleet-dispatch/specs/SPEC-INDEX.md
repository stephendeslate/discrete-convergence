# Fleet Dispatch — Specification Index

## Project Overview

Fleet Dispatch (FD) is a multi-tenant fleet and vehicle dispatch management system built with NestJS 11, Next.js 15, Prisma ORM, and PostgreSQL. It supports role-based access control (ADMIN, VIEWER, DISPATCHER), tenant isolation via Row Level Security, and comprehensive monitoring infrastructure.

## Architecture Summary

The project follows a Turborepo monorepo structure with three workspaces:

- **apps/api** — NestJS 11 backend with Prisma ORM, JWT authentication, RBAC, rate limiting, and monitoring
- **apps/web** — Next.js 15 frontend with App Router, shadcn/ui components (9 components), server actions, and accessibility features
- **packages/shared** — Shared TypeScript types, constants, utilities (pagination, logging, correlation, env validation)

## Specification Documents

| Document | Domain | VERIFY Range | Status |
|----------|--------|-------------|--------|
| [authentication.md](authentication.md) | Auth & JWT | FD-AUTH-001 to FD-AUTH-005 | Complete |
| [data-model.md](data-model.md) | Prisma Schema & Data | FD-DATA-001, FD-DATA-003 | Complete |
| [api-endpoints.md](api-endpoints.md) | REST API & CRUD | FD-VEH-001 to FD-DISP-002 | Complete |
| [frontend.md](frontend.md) | UI & Components | FD-UI-001 to FD-UI-003, FD-FI-001 to FD-FI-003 | Complete |
| [infrastructure.md](infrastructure.md) | Docker & CI/CD | FD-INFRA-001 to FD-INFRA-002 | Complete |
| [security.md](security.md) | Security & RBAC | FD-SEC-001 to FD-SEC-005 | Complete |
| [monitoring.md](monitoring.md) | Health & Logging | FD-MON-001 to FD-MON-008 | Complete |
| [cross-layer.md](cross-layer.md) | Integration & Perf | FD-CROSS-001, FD-PERF-001 to FD-PERF-003 | Complete |
| [edge-cases.md](edge-cases.md) | Boundary Conditions | N/A (14 edge case entries) | Complete |

## Cross-Cutting Concerns

### Authentication Flow
Login produces a JWT token containing userId, email, role, and tenantId. All protected endpoints validate the JWT and extract tenant context. Rate limiting (3 req/s) applies to login and register. See [authentication.md](authentication.md) for details.

### Tenant Isolation
Every data query filters by tenantId extracted from the JWT payload. Row Level Security policies in PostgreSQL provide database-level enforcement using TEXT comparison (no ::uuid cast). See [security.md](security.md) and [data-model.md](data-model.md).

### Monitoring Pipeline
Correlation IDs propagate through all requests via middleware. Structured logging via Pino captures method, URL, status, duration, and correlation context. Exception filter sanitizes sensitive fields before logging. See [monitoring.md](monitoring.md).

### Performance Strategy
Response time headers (X-Response-Time) on all endpoints, pagination with MAX_PAGE_SIZE clamping (100), database indexes on tenantId and status fields, and Prisma parameterized queries. See [cross-layer.md](cross-layer.md).

## Dependency Notes

- Prisma ORM pinned to >=6.0.0 <7.0.0 range for schema stability
- bcryptjs (pure JS) used instead of bcrypt to avoid native dependency vulnerabilities
- pnpm.overrides for effect>=3.20.0 to fix Prisma transitive vulnerability
- ESLint 9 with flat config format (eslint.config.mjs)
- autocannon in devDependencies for load testing

## Traceability

All specifications use VERIFY tags in the format `VERIFY: FD-{DOMAIN}-{NNN}`. Each VERIFY tag has a corresponding TRACED tag in a `.ts` or `.tsx` source file. The project maintains 100% bidirectional parity between VERIFY and TRACED tags with zero orphans.

Total VERIFY/TRACED pairs: 40

## Test Coverage

- Co-located unit tests: 6 service/guard spec files in src/ with behavioral assertions (toHaveBeenCalledWith)
- Integration tests: 6 supertest-based files in test/ testing real AppModule compilation
- Security tests: auth failure scenarios, validation, rate limiting, CSP, CORS
- Performance tests: response time headers, health endpoint latency, rapid requests
- Accessibility tests: jest-axe violations on real components, keyboard navigation
- Cross-layer tests: full pipeline verification from auth through monitoring
- Shared package tests: log sanitizer with 14 test cases including arrays and deep nesting
