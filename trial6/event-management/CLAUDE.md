# Event Management Platform

Multi-tenant event management platform built with NestJS + Next.js + Prisma.

## Architecture

- **apps/api** — NestJS 11 REST API with Prisma ORM, JWT auth, RBAC guards
- **apps/web** — Next.js 15 (App Router) + React 19 + Tailwind CSS frontend
- **packages/shared** — Shared constants, types, utilities (correlation IDs, log formatting)

## Conventions

- **No console.log** — use Pino structured JSON logger via `LoggerService`
- **No $executeRaw** — use Prisma client methods only
- **findFirst requires justification** — add a `// justification: ...` comment when using `findFirst` over `findUnique`
- **import type** for type-only imports
- **Decimal** for monetary values (ticket prices) — never use float
- **X-Correlation-ID** header on all API requests (auto-injected by middleware)
- **snake_case** for database columns (@@map), **camelCase** in application code
- **Trace tags** format: `TRACED:EM-XXX-NNN` — link code to spec VERIFY tags

## Auth Flow

- API: JWT Bearer token in Authorization header
- Web: httpOnly cookies (`token` for JWT, `session` for user data)
- Roles: ADMIN > ORGANIZER > VIEWER
- All data scoped by `tenantId` (RLS enforced at DB level)

## Testing

- API: `pnpm --filter @event-management/api test` (Jest + ts-jest)
- Web: `pnpm --filter @event-management/web test` (Jest + @testing-library/react + jest-axe)
- Shared: `pnpm --filter @event-management/shared test`
- All: `pnpm turbo test`

## Development

```bash
pnpm install
pnpm turbo build
docker compose up -d postgres redis
pnpm --filter @event-management/api prisma:migrate
pnpm --filter @event-management/api prisma:seed
pnpm turbo dev
```

## Key Files

- `apps/api/prisma/schema.prisma` — Data model source of truth
- `apps/api/prisma/migrations/` — SQL migrations with RLS policies
- `specs/SPEC-INDEX.md` — Specification index with all VERIFY tags
- `apps/api/src/common/` — Shared decorators, guards, pipes, DTOs
