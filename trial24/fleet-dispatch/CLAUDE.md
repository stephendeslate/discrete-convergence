# Fleet Dispatch

## Project Overview
Multi-tenant fleet dispatch platform. Companies manage vehicles, drivers, routes, dispatches, trips, maintenance records, and zones.

## Architecture
- **Monorepo**: pnpm workspaces + Turborepo
- **API**: NestJS 11, Prisma 6, PostgreSQL 16 with RLS
- **Web**: Next.js 15, React 19, Tailwind CSS
- **Shared**: Constants, utilities shared across packages

## Tenant Key
- Tenant isolation uses `companyId` (NOT tenantId)
- PostgreSQL RLS via `app.company_id` session variable
- TenantGuard extracts companyId from JWT and sets RLS context

## Key Conventions
- `bcryptjs` (not bcrypt), salt rounds = 12
- ESLint 9 flat config (`eslint.config.mjs`)
- Port from `process.env.PORT ?? '3001'`
- Health at `/health` and `/health/ready`
- JWT: access=15m, refresh=7d
- class-validator for DTOs
- Pino logging (pino-pretty in dev only)
- Helmet with CSP frame-ancestors 'none'
- No `as any`, no `console.log`, no `||` env fallback, no `$executeRawUnsafe`
- Default role: VIEWER (no admin self-registration)
- ThrottlerModule limit=20000

## Commands
```bash
pnpm install          # install deps
pnpm build            # build all packages
pnpm test             # run all tests
pnpm dev              # dev mode
pnpm db:migrate       # run prisma migrations
pnpm db:seed          # seed database
```

## Testing
- Unit tests co-located in `src/` as `*.spec.ts`
- Integration tests in `test/` using supertest
- Run API tests: `pnpm --filter api test`
- Run web tests: `pnpm --filter web test`
