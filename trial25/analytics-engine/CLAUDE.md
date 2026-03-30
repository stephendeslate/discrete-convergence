# Analytics Engine — CLAUDE.md

## Project Overview

Multi-tenant analytics platform monorepo: NestJS 11 API + Next.js 15 frontend + shared package.

## Quick Start

```bash
pnpm install
cp .env.example .env
# Start PostgreSQL via docker-compose
docker compose up -d postgres
# Run migrations
cd apps/api && npx prisma migrate dev
# Start dev servers
pnpm dev
```

## Monorepo Structure

- `apps/api` — NestJS 11 backend (port 3001)
- `apps/web` — Next.js 15 frontend (port 3000)
- `packages/shared` — Common utilities (@repo/shared)

## Key Commands

```bash
pnpm install          # Install all deps
pnpm build            # Build all packages (turbo)
pnpm test             # Run all tests (turbo)
pnpm lint             # Lint all packages (turbo)
pnpm typecheck        # Type check all packages (turbo)
```

## Architecture Decisions

- **Auth**: JWT via passport-jwt, bcryptjs with 12 salt rounds
- **Multi-tenancy**: Row Level Security (RLS) at database level + TenantGuard
- **Validation**: Global ValidationPipe with forbidNonWhitelisted: true
- **Rate Limiting**: ThrottlerModule limit >= 20000 (APP_GUARD)
- **Logging**: nestjs-pino structured logging
- **Styling**: Tailwind CSS with cn() utility (clsx + tailwind-merge)

## Coding Standards

- No `as any` casts in API source
- No console.log in API source (use Logger)
- No `|| 'fallback'` env patterns (use `?? 'default'`)
- All DTO strings must have @MaxLength()
- All findFirst() calls must have justification comments
- TRACED tags in .ts/.tsx files for traceability
- VERIFY tags in spec files for scoring validation

## Test Commands

```bash
cd apps/api && pnpm test       # API unit + integration tests
cd apps/web && pnpm test       # Web tests
cd packages/shared && pnpm test # Shared package tests
```

## Environment Variables

See `.env.example` for all required variables.
Critical: DATABASE_URL, JWT_SECRET, PORT (default 3001).
