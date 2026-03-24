# Event Management — Specification Index

## Project Identity
- **Prefix**: EM-*
- **Domain**: Multi-tenant event management with ticketing and check-in
- **Stack**: NestJS 11 + Next.js 15 + Prisma 6 + PostgreSQL 16 + Turborepo 2

## Specification Documents

| # | Document | Description | Cross-References |
|---|----------|-------------|------------------|
| 1 | [authentication.md](./authentication.md) | JWT auth, registration, role-based access, guards | data-model, api-endpoints, security |
| 2 | [data-model.md](./data-model.md) | Prisma schema, 14 models, 7 enums, RLS, migrations, seed | authentication, api-endpoints |
| 3 | [api-endpoints.md](./api-endpoints.md) | REST endpoints, pagination, caching, domain modules | authentication, data-model, monitoring |
| 4 | [frontend.md](./frontend.md) | Next.js 15 app router, shadcn/ui, dark mode, accessibility | api-endpoints, security |
| 5 | [infrastructure.md](./infrastructure.md) | Docker, CI/CD, environment configuration | data-model, monitoring |
| 6 | [security.md](./security.md) | CORS, helmet, throttling, input validation, RLS | authentication, data-model, monitoring |
| 7 | [monitoring.md](./monitoring.md) | Structured logging, correlation IDs, metrics, health | api-endpoints, security |

## Tech Stack
- **Runtime**: Node.js 20 (Alpine for containers)
- **API**: NestJS 11 with global guards (ThrottlerGuard + JwtAuthGuard), filters, interceptors
- **Frontend**: Next.js 15 with App Router, React 19, Tailwind CSS 4, shadcn/ui
- **ORM**: Prisma 6 with PostgreSQL 16
- **Build**: Turborepo 2 with pnpm workspaces
- **Shared**: `packages/shared` exports 8+ utilities (constants, correlation, logging, validation)

## Scoring Dimensions
1. Structural Compliance — monorepo layout, file placement, naming
2. Schema Quality — models, enums, maps, indexes, RLS
3. API Completeness — endpoints, guards, filters, interceptors, pagination
4. Frontend Quality — routes, components, dark mode, loading/error states
5. Security Posture — CORS, helmet, throttle, validation, RLS
6. Test Coverage — unit, integration, cross-layer, a11y, keyboard, security, performance
7. Monitoring — structured logs, correlation IDs, metrics, health checks
8. Infrastructure — Docker, CI/CD, env config
9. Convention Compliance — no `as any`, no `console.log`, no `|| 'value'` fallbacks
10. Shared Package — 8+ exports, proper barrel file
11. Specification Quality — 7 docs, VERIFY/TRACED parity, cross-references
12. Documentation — CLAUDE.md >= 80 lines

## Monorepo Structure
- `apps/api` — NestJS 11 REST API, global guards/filters/interceptors via DI
- `apps/web` — Next.js 15 App Router with server actions for form handling
- `packages/shared` — Barrel-exported utilities consumed by both apps
- Root `turbo.json` defines task pipeline: build depends on ^build, test depends on build
- pnpm workspaces ensure single lockfile and hoisted dependencies

## Testing Strategy
- 3 unit test suites covering AuthService, EventService, RegistrationService
- 6 integration test suites covering auth flow, event lifecycle, cross-layer, monitoring, security, performance
- Frontend tests: jest-axe accessibility audits and keyboard navigation coverage
- All tests run via `pnpm turbo test` with PostgreSQL service container in CI
- Cross-reference: [security.md](./security.md) — Convention gates enforced via linting

## VERIFY/TRACED Tag Summary
- Total VERIFY tags across specs: 84+
- All VERIFY tags have corresponding TRACED tags in implementation
- Prefix: EM-* (e.g., EM-AUTH-001, EM-SCHEMA-001, EM-TEST-001)
- VERIFY:EM-TRACE-001 — Every VERIFY tag has a matching TRACED tag in source code
