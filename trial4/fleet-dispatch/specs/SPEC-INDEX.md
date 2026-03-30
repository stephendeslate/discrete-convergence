# Fleet Dispatch — Specification Index

## Overview

This document indexes all specification documents for the Fleet Dispatch platform,
a multi-tenant field service dispatch system built with NestJS 11, Next.js 15, and
PostgreSQL 16. The platform manages work orders, technicians, routes, and invoicing.

## Specification Documents

| # | Document | Description | VERIFY Tags |
|---|----------|-------------|-------------|
| 1 | [authentication.md](authentication.md) | JWT auth, registration, role enforcement | FD-AUT-* |
| 2 | [data-model.md](data-model.md) | Prisma schema, indexes, RLS, Decimal types | FD-DAT-* |
| 3 | [api-endpoints.md](api-endpoints.md) | REST endpoints, DTOs, validation, pagination | FD-API-* |
| 4 | [frontend.md](frontend.md) | Next.js pages, shadcn/ui, dark mode, a11y | FD-FRN-*, FD-AX-* |
| 5 | [security.md](security.md) | Helmet CSP, rate limiting, CORS, validation | FD-SEC-* |
| 6 | [monitoring.md](monitoring.md) | Pino logger, correlation IDs, health, metrics | FD-MON-* |
| 7 | [infrastructure.md](infrastructure.md) | Docker, CI/CD, seed, migrations | FD-INF-* |
| 8 | [cross-layer.md](cross-layer.md) | Global providers, integration verification | FD-CRS-* |

## Tag Prefix Convention

All tags use the prefix **FD-** (Fleet Dispatch).

- **VERIFY** tags appear only in spec files (specs/*.md)
- **TRACED** tags appear only in source files (.ts/.tsx)
- Every VERIFY tag must have a matching TRACED tag and vice versa

## Domain Summary

Fleet Dispatch supports the following core workflows:

1. **Dispatch Management** — Create, assign, and track work orders through a 9-state machine
2. **Technician Tracking** — Manage field workers with skills, availability, and GPS positions
3. **Route Optimization** — Create optimized routes for technicians with ordered stops
4. **Customer Management** — Maintain customer records with geocoded addresses
5. **Invoicing** — Generate invoices from work orders with line items and status tracking
6. **Audit Trail** — Immutable logging of all state changes for compliance

## Architecture

The system follows a Turborepo monorepo structure:

- `apps/api/` — NestJS 11 backend with Prisma ORM
- `apps/web/` — Next.js 15 frontend with shadcn/ui components
- `packages/shared/` — Shared constants, utilities, and types

## Cross-References

Each spec document cross-references related specs for traceability.
See [authentication.md](authentication.md) for auth flow details.
See [data-model.md](data-model.md) for schema design decisions.
See [security.md](security.md) for security hardening measures.
See [monitoring.md](monitoring.md) for observability architecture.
See [cross-layer.md](cross-layer.md) for integration verification.
