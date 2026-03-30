# Event Management — Project Instructions

## Architecture
- Monorepo: pnpm workspaces + Turborepo
- API: NestJS 11 + Prisma 6 + PostgreSQL 16 with RLS
- Web: Next.js 15 + React 19 + Tailwind CSS
- Shared: `@em/shared` constants and utilities

## Tenant Key
- `organizationId` everywhere (NOT tenantId)
- RLS uses `app.organization_id` session variable

## Auth
- bcryptjs with BCRYPT_SALT_ROUNDS=12
- JWT access=15m, refresh=7d
- Default role: VIEWER (no admin self-registration)

## Testing
- Unit tests: co-located in `src/` as `*.spec.ts`
- Integration tests: `test/` directory with supertest
- Run: `pnpm test` from root

## Code Quality
- No `as any`, no `console.log`, no `|| ` for env fallback
- No `$executeRawUnsafe`
- ESLint 9 flat config
- class-validator for DTOs
- Pino structured logging

## Commands
- `pnpm build` — build all packages
- `pnpm test` — run all tests
- `pnpm dev` — start dev servers
- `pnpm db:migrate` — run Prisma migrations
- `pnpm db:seed` — seed database
