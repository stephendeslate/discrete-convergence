# Specification Index — Analytics Engine

## Project

- **Domain prefix:** AE-
- **Methodology:** CED v1.0-dc (Convergence Engineering Development)
- **Tech stack:** NestJS 11 + Next.js 15 + Prisma + PostgreSQL + Turborepo

## Specification Files

| File | Domain | VERIFY Tags | Description |
|------|--------|-------------|-------------|
| [authentication.md](authentication.md) | AUTH | AE-AUTH-001 – AE-AUTH-007 | JWT auth, bcryptjs hashing, registration, login flows |
| [data-model.md](data-model.md) | DATA, DASH, WIDG, DS | AE-DATA-001 – AE-DATA-003, AE-DASH-001, AE-WIDG-001, AE-DS-001 | Prisma schema, seed data, service CRUD, RLS |
| [api-endpoints.md](api-endpoints.md) | DASH, WIDG, DS | AE-DASH-002 – AE-DASH-003, AE-WIDG-002, AE-DS-002 | Controller endpoints, routing, tenant context |
| [frontend.md](frontend.md) | UI, FI, AX | AE-UI-001 – AE-UI-004, AE-FI-001 – AE-FI-006, AE-AX-001 – AE-AX-002 | Next.js pages, server actions, a11y tests |
| [security.md](security.md) | SEC, ARCH | AE-SEC-001 – AE-SEC-011, AE-ARCH-002 – AE-ARCH-003 | CSP, CORS, validation, guards, RLS, error sanitization |
| [infrastructure.md](infrastructure.md) | ARCH | AE-ARCH-001 | AppModule, Docker, CI/CD, deployment |
| [monitoring.md](monitoring.md) | MON, PERF | AE-MON-001 – AE-MON-012, AE-PERF-001 – AE-PERF-006 | Logging, metrics, health checks, performance |
| [cross-layer.md](cross-layer.md) | CROSS | AE-CROSS-001 | End-to-end integration testing |

## Tag Summary

| Domain | Count | Range |
|--------|-------|-------|
| AUTH | 7 | AE-AUTH-001 – AE-AUTH-007 |
| SEC | 11 | AE-SEC-001 – AE-SEC-011 |
| ARCH | 3 | AE-ARCH-001 – AE-ARCH-003 |
| MON | 12 | AE-MON-001 – AE-MON-012 |
| PERF | 6 | AE-PERF-001 – AE-PERF-006 |
| DATA | 3 | AE-DATA-001 – AE-DATA-003 |
| DASH | 3 | AE-DASH-001 – AE-DASH-003 |
| WIDG | 2 | AE-WIDG-001 – AE-WIDG-002 |
| DS | 2 | AE-DS-001 – AE-DS-002 |
| UI | 4 | AE-UI-001 – AE-UI-004 |
| FI | 6 | AE-FI-001 – AE-FI-006 |
| AX | 2 | AE-AX-001 – AE-AX-002 |
| CROSS | 1 | AE-CROSS-001 |
| **Total** | **62** | |

## Traceability

Every VERIFY tag in specs has a corresponding TRACED tag in source code.
Every TRACED tag in source code has a corresponding VERIFY tag in specs.
Zero orphan tags in either direction.

## Gate Requirements

- 7 spec files (minimum) — 8 provided
- Each spec file >= 55 lines — verified
- SPEC-INDEX >= 60 lines — verified
- >= 35 VERIFY tags — 62 provided
- Zero orphan VERIFY tags (no VERIFY without matching TRACED)
- Zero orphan TRACED tags (no TRACED without matching VERIFY)

## Methodology Compliance

This project follows CED v1.0-dc with:
- 10 implementation layers (L1–L10)
- 11 verification gates (G1–G11)
- Bidirectional traceability (VERIFY ↔ TRACED)
- Defense-in-depth security model
- Multi-tenant isolation via RLS
- Structured observability pipeline
