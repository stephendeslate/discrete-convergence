# Fleet Dispatch — Specification Index

## Project Overview

Fleet Dispatch is a multi-tenant logistics management platform for tracking
vehicles, drivers, dispatches, and delivery routes. Built as a Turborepo
monorepo with NestJS API, Next.js web frontend, and shared utility package.

## Specification Files

| File | Domain | VERIFY Tags | Description |
|------|--------|-------------|-------------|
| [authentication.md](authentication.md) | Auth | FD-AUTH-001 to FD-AUTH-008 | JWT auth, registration, login, token storage |
| [data-model.md](data-model.md) | Data | FD-DATA-013 | Prisma schema, RLS, entity definitions |
| [api-endpoints.md](api-endpoints.md) | API | FD-VEH-*, FD-DRV-*, FD-DSP-*, FD-RTE-*, FD-SHARED-002 | RESTful endpoints for all domain entities |
| [frontend.md](frontend.md) | UI | FD-UI-001 to FD-UI-006, FD-FI-001, FD-FI-002 | Next.js pages, server actions, components |
| [infrastructure.md](infrastructure.md) | Infra | FD-INFRA-001 to FD-INFRA-004 | Docker, CI/CD, database, monorepo config |
| [security.md](security.md) | Security | FD-SEC-001 to FD-SEC-005, FD-SHARED-001, FD-ARCH-001 | Guards, RBAC, validation, RLS, error handling |
| [monitoring.md](monitoring.md) | Monitoring | FD-MON-001 to FD-MON-011, FD-PERF-001 to FD-PERF-007 | Health, metrics, logging, performance |

## Tag Summary

Total VERIFY tags: 63
Total TRACED tags: 63
Orphan count: 0

### Tag Prefixes

| Prefix | Count | Domain |
|--------|-------|--------|
| FD-AUTH | 8 | Authentication and authorization |
| FD-VEH | 4 | Vehicle management |
| FD-DRV | 4 | Driver management |
| FD-DSP | 4 | Dispatch management |
| FD-RTE | 4 | Route management |
| FD-SEC | 5 | Security enforcement |
| FD-MON | 11 | Monitoring and observability |
| FD-PERF | 7 | Performance verification |
| FD-UI | 6 | Frontend user interface |
| FD-FI | 2 | Functional integration |
| FD-INFRA | 4 | Infrastructure and deployment |
| FD-SHARED | 2 | Shared package utilities |
| FD-DATA | 1 | Data model schema |
| FD-ARCH | 1 | Architecture patterns |

## Architecture Layers

### Layer 1: Shared Package (packages/shared)
- Constants, utilities, validators
- No framework dependencies, pure TypeScript

### Layer 2: API Backend (apps/api)
- NestJS 11 with Prisma ORM
- JWT authentication with bcryptjs
- Global guards, filters, interceptors
- Domain modules: vehicle, driver, dispatch, route

### Layer 3: Web Frontend (apps/web)
- Next.js 15 with React 19
- Tailwind CSS 4 with shadcn/ui components
- Server actions for API communication
- Cookie-based token storage

### Layer 4: Infrastructure
- Docker multi-stage builds
- PostgreSQL 16 with RLS
- GitHub Actions CI/CD
- pnpm + Turborepo workspaces

## Methodology Compliance

- CED v1.3-dc methodology followed
- ESLint 9 flat config (eslint.config.mjs)
- Test library type augmentations configured
- No inline fixture components in frontend tests
- Monitoring controller fully @Public()
- bcryptjs used (not bcrypt) for zero tar vulnerabilities
- pnpm.overrides for effect>=3.20.0
