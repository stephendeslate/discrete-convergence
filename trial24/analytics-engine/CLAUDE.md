# Analytics Engine

## Project Structure
- `apps/api` — NestJS 11 REST API with Prisma 6 + PostgreSQL 16
- `apps/web` — Next.js 15 frontend with React 19 + Tailwind CSS
- `packages/shared` — Shared types, constants, utilities

## Commands
- `pnpm install` — Install all dependencies
- `pnpm run build` — Build all packages (turbo)
- `pnpm run lint` — Lint all packages
- `pnpm run typecheck` — Type check all packages
- `pnpm run test` — Run all tests
- `pnpm --filter api run test` — Run API tests only
- `pnpm --filter api exec prisma generate` — Generate Prisma client
- `pnpm --filter api exec prisma migrate deploy` — Run migrations

## Key Decisions
- bcryptjs (not bcrypt) with BCRYPT_SALT_ROUNDS=12
- ThrottlerModule limit=20000 (for load testing)
- ESLint 9 flat config (eslint.config.mjs)
- JWT access=15m, refresh=7d
- PORT from env, defaults to 3001
- Health endpoints at /health and /health/ready
- PostgreSQL RLS for tenant isolation (tenantId)
