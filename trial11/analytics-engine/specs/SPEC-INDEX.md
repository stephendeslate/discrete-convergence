# Specification Index

## Project: Analytics Engine
## Trial: 11
## Methodology: CED v1.2-dc

## Specification Files

| File | Layer | Tag Prefix | Tag Count | Description |
|------|-------|------------|-----------|-------------|
| [authentication.md](authentication.md) | L4 | AE-AUTH | 12 | JWT auth, bcryptjs, registration, login, guards |
| [data-model.md](data-model.md) | L2 | AE-DATA | 3 | Prisma schema, RLS policies, migrations |
| [api-endpoints.md](api-endpoints.md) | L5 | AE-DASH, AE-DS, AE-WID | 13 | Dashboard, DataSource, Widget CRUD |
| [frontend.md](frontend.md) | L6 | AE-UI, AE-FI | 11 | Next.js pages, server actions, components |
| [infrastructure.md](infrastructure.md) | L1 | AE-ARCH | 4 | Docker, CI/CD, monorepo structure |
| [security.md](security.md) | L7 | AE-SEC | 9 | Helmet, throttle, CORS, validation, RBAC |
| [monitoring.md](monitoring.md) | L8 | AE-MON | 13 | Health, metrics, logging, correlation IDs |
| [performance.md](performance.md) | L5 | AE-PERF | 5 | Pagination, response time, limits |
| [cross-layer.md](cross-layer.md) | L9 | — | 0 | Integration contracts, pipeline flow |

## Tag Ranges

| Prefix | Range | Spec File |
|--------|-------|-----------|
| AE-AUTH | 001–012 | authentication.md |
| AE-DATA | 001–003 | data-model.md |
| AE-DASH | 001–005 | api-endpoints.md |
| AE-DS | 001–004 | api-endpoints.md |
| AE-WID | 001–004 | api-endpoints.md |
| AE-UI | 001–006 | frontend.md |
| AE-FI | 001–005 | frontend.md |
| AE-ARCH | 001–004 | infrastructure.md |
| AE-SEC | 001–009 | security.md |
| AE-MON | 001–013 | monitoring.md |
| AE-PERF | 001–005 | performance.md |

## Traceability Summary

- **Total VERIFY tags**: 70
- **Total TRACED tags**: 70
- **Orphan VERIFY (no matching TRACED)**: 0
- **Orphan TRACED (no matching VERIFY)**: 0
- **Bidirectional pairs**: 70

## Tag Conventions

- VERIFY tags appear ONLY in spec files (`.md` files under `specs/`)
- TRACED tags appear ONLY in source files (`.ts` and `.tsx` files)
- Each VERIFY tag has exactly one matching TRACED tag
- Tags follow the format: `AE-{DOMAIN}-{NNN}`
- Tag prefixes are scoped to a single spec file (no cross-file prefix sharing)

## Layer Mapping

| Layer | Name | Artifacts |
|-------|------|-----------|
| L0 | Scaffolding | package.json, tsconfig, turbo.json, pnpm-workspace |
| L1 | Infrastructure | Dockerfile, docker-compose, CI workflow, .env.example |
| L2 | Data Model | Prisma schema, migrations, seed, RLS policies |
| L3 | Specifications | This index, all spec files, VERIFY tags |
| L4 | Authentication | JWT strategy, guards, auth service, bcryptjs |
| L5 | Domain Logic | Dashboard, DataSource, Widget modules, pagination |
| L6 | Frontend | Next.js pages, server actions, shadcn/ui components |
| L7 | Security | Helmet CSP, ThrottlerModule, CORS, ValidationPipe |
| L8 | Monitoring | Health, readiness, metrics, correlation, logging |
| L9 | Cross-Layer | Integration tests, cumulative regression, pipeline |
