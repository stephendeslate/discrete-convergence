# Fleet Dispatch — Specification Index

## Project Overview

Fleet Dispatch is a fleet management system for tracking vehicles,
drivers, routes, dispatches, and maintenance records. It is built
as a Turborepo monorepo with NestJS 11 API, Next.js 15 web frontend,
and a shared utilities package.

## Tag Prefix

All VERIFY/TRACED tags use the `FD-` prefix with domain identifiers:
- `FD-AUTH-*` — Authentication and authorization
- `FD-SEC-*` — Security controls and policies
- `FD-VEH-*` — Vehicle management
- `FD-DRV-*` — Driver management
- `FD-RTE-*` — Route management
- `FD-DSP-*` — Dispatch management
- `FD-MNT-*` — Maintenance management
- `FD-MON-*` — Monitoring and observability
- `FD-PERF-*` — Performance optimization
- `FD-INFRA-*` — Infrastructure and deployment
- `FD-UI-*` — User interface components
- `FD-AX-*` — Accessibility
- `FD-FI-*` — Frontend integration
- `FD-DATA-*` — Data architecture
- `FD-ARCH-*` — Application architecture
- `FD-CROSS-*` — Cross-layer integration

## Specification Documents

| File | Description | Tags |
|------|-------------|------|
| [authentication.md](authentication.md) | JWT auth, registration, login flow | FD-AUTH-001 through FD-AUTH-010 |
| [data-model.md](data-model.md) | Prisma schema, domain models, DTOs | FD-VEH-*, FD-DRV-*, FD-RTE-*, FD-DSP-*, FD-MNT-*, FD-DATA-* |
| [api-endpoints.md](api-endpoints.md) | REST API endpoints, routing, FI | FD-ARCH-001, FD-FI-001 through FD-FI-004 |
| [frontend.md](frontend.md) | Next.js pages, components, a11y | FD-UI-*, FD-AX-* |
| [infrastructure.md](infrastructure.md) | Docker, CI/CD, env config | FD-INFRA-001 through FD-INFRA-003 |
| [security.md](security.md) | Auth guards, rate limiting, RBAC | FD-SEC-001 through FD-SEC-008 |
| [monitoring.md](monitoring.md) | Logging, health, metrics, filters | FD-MON-001 through FD-MON-012 |
| [cross-layer.md](cross-layer.md) | Integration tests, performance | FD-CROSS-001, FD-PERF-001 through FD-PERF-006 |

## Tag Summary

| Domain | Count | Range |
|--------|-------|-------|
| AUTH | 10 | FD-AUTH-001 — FD-AUTH-010 |
| SEC | 8 | FD-SEC-001 — FD-SEC-008 |
| VEH | 3 | FD-VEH-001 — FD-VEH-003 |
| DRV | 3 | FD-DRV-001 — FD-DRV-003 |
| RTE | 3 | FD-RTE-001 — FD-RTE-003 |
| DSP | 3 | FD-DSP-001 — FD-DSP-003 |
| MNT | 3 | FD-MNT-001 — FD-MNT-003 |
| MON | 12 | FD-MON-001 — FD-MON-012 |
| PERF | 6 | FD-PERF-001 — FD-PERF-006 |
| INFRA | 3 | FD-INFRA-001 — FD-INFRA-003 |
| UI | 4 | FD-UI-001 — FD-UI-004 |
| AX | 2 | FD-AX-001 — FD-AX-002 |
| FI | 4 | FD-FI-001 — FD-FI-004 |
| DATA | 2 | FD-DATA-001 — FD-DATA-002 |
| ARCH | 1 | FD-ARCH-001 |
| CROSS | 1 | FD-CROSS-001 |
| **Total** | **68** | |

## Conventions

- Every VERIFY tag in specs has a matching TRACED tag in source code
- Every TRACED tag in source code has a matching VERIFY tag in specs
- TRACED comments appear only in `.ts` and `.tsx` files
- Cross-references use markdown link syntax between spec files
