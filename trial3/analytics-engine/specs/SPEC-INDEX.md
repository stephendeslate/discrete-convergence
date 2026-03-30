# Analytics Engine — Specification Index

## Overview

This document indexes all specification documents for the Analytics Engine project,
a multi-tenant embeddable analytics platform. Each specification covers a distinct
layer of the system architecture and contains VERIFY tags that trace to
implementation TRACED tags in TypeScript source files.

## Project Identity

- **Project:** Analytics Engine
- **Domain:** Multi-tenant embeddable analytics for SaaS companies
- **Trial:** 3 (Discrete Convergence Experiment)
- **Tag Prefix:** AE-
- **Version:** 1.0.0

## Specification Documents

| # | File | Layer | Description |
|---|------|-------|-------------|
| 1 | [authentication.md](authentication.md) | L0, L1 | JWT auth, bcrypt hashing, registration rules |
| 2 | [data-model.md](data-model.md) | L0 | Prisma schema, RLS, indexes, enums |
| 3 | [api-endpoints.md](api-endpoints.md) | L0, L1 | REST endpoints, CRUD operations, DTOs |
| 4 | [frontend.md](frontend.md) | L2 | Next.js pages, shadcn/ui, accessibility |
| 5 | [infrastructure.md](infrastructure.md) | L4, L5 | Docker, CI/CD, monorepo, shared package |
| 6 | [security.md](security.md) | L6 | Helmet CSP, rate limiting, CORS, validation |
| 7 | [monitoring.md](monitoring.md) | L8 | Pino logging, correlation IDs, health, metrics |
| 8 | [cross-layer.md](cross-layer.md) | L9 | Provider chain, cumulative verification |

## VERIFY Tag Registry

All VERIFY tags use the `AE-` prefix. Each tag traces to exactly one
TRACED tag in a `.ts` or `.tsx` source file.

### Tag Ranges

| Spec | Tag Range | Count |
|------|-----------|-------|
| authentication.md | AE-AUTH-001 to AE-AUTH-005 | 5 |
| data-model.md | AE-DASH-001, AE-WIDGET-001, AE-DS-001, AE-RLS-001, AE-RAW-001 | 5 |
| api-endpoints.md | AE-PERF-001 to AE-PERF-005 | 5 |
| frontend.md | AE-UI-001 to AE-UI-003, AE-AX-001 to AE-AX-004 | 7 |
| infrastructure.md | AE-INFRA-001, AE-SEED-001, AE-SHARED-001 | 3 |
| security.md | AE-SEC-001 to AE-SEC-003 | 3 |
| monitoring.md | AE-MON-001 to AE-MON-006 | 6 |
| cross-layer.md | AE-ARCH-001, AE-CROSS-001 | 2 |
| **Total** | | **36** |

## Conventions

- VERIFY tags appear only in `.md` spec files
- TRACED tags appear only in `.ts` and `.tsx` source files
- Every VERIFY must have exactly one matching TRACED
- Every TRACED must match exactly one VERIFY
- Zero orphan tags in either direction

## Cross-Reference Index

- authentication.md references: security.md, monitoring.md
- data-model.md references: api-endpoints.md, infrastructure.md
- security.md references: authentication.md, monitoring.md
- cross-layer.md references: authentication.md, security.md, monitoring.md
