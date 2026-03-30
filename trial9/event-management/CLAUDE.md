# Event Management Platform — CLAUDE.md

## Project Overview

Event Management is a multi-tenant platform built with the CED v1.0-dc methodology.
It is part of the discrete-convergence experiment (Trial 9).

## Architecture

Turborepo monorepo with pnpm workspaces:
- `apps/api` — NestJS 11 backend with Prisma ORM
- `apps/web` — Next.js 15 frontend with React 19
- `packages/shared` — Constants, utilities, types shared across apps

## Key Commands

```bash
pnpm install                    # Install all dependencies
pnpm turbo run build            # Build all packages
pnpm turbo run lint             # Lint all packages
pnpm turbo run typecheck        # Type check all packages
pnpm turbo run test             # Run all test suites
pnpm audit --audit-level=high   # Security audit
```

## Development

```bash
pnpm turbo run dev              # Start all apps in dev mode
```

API runs on port 3001 by default. Web runs on port 3000.

## Database

PostgreSQL 16 with Prisma ORM (pinned >=6.0.0 <7.0.0).

```bash
cd apps/api
npx prisma migrate dev          # Run migrations
npx prisma db seed              # Seed database
npx prisma generate             # Generate client
```

### Row Level Security
All tables have RLS enabled with tenant isolation policies.
RLS policies use direct TEXT comparison — no `::uuid` cast on TEXT columns.

## Authentication

- JWT-based auth with bcryptjs (NOT bcrypt — avoids native tar vulnerability)
- Global JwtAuthGuard registered as APP_GUARD
- @Public() decorator exempts specific routes (health, auth)
- @Roles() decorator for RBAC (ADMIN, ORGANIZER, USER)
- ALLOWED_REGISTRATION_ROLES restricts self-registration to USER and ORGANIZER

## Shared Package

Exports >= 8 utilities:
- BCRYPT_SALT_ROUNDS, ALLOWED_REGISTRATION_ROLES, MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE
- APP_VERSION
- createCorrelationId, formatLogEntry, sanitizeLogContext
- validateEnvVars, parsePagination

Every export must be consumed by >= 1 app. No dead exports.

## Global Provider Chain

AppModule registers providers in this order:
1. APP_GUARD: ThrottlerGuard (rate limiting)
2. APP_GUARD: JwtAuthGuard (authentication)
3. APP_GUARD: RolesGuard (authorization)
4. APP_FILTER: GlobalExceptionFilter (error handling)
5. APP_INTERCEPTOR: ResponseTimeInterceptor (performance tracking)

Domain controllers do NOT use @UseGuards(JwtAuthGuard) — they rely on the global guard.

## Middleware Chain

Order: CorrelationId -> RequestLogging -> Guards -> Interceptors -> Controllers

## Testing

Test files are in `apps/api/test/` and `apps/web/__tests__/`.
Each test block should have >= 2 expect assertions for density.

## Specification Traceability

VERIFY tags live in `specs/*.md` files. TRACED tags live in source code.
Every VERIFY tag must have a matching TRACED tag and vice versa.
All tags use the EM- prefix.

## Code Quality Rules

- Zero `as any` in source code
- Zero `|| 'fallback'` for env vars — use `??` instead
- Zero `console.log` in API source (use Pino logger)
- All DTOs use class-validator decorators (minimum 10 instances)
- findFirst requires justification comment where used

## Frontend

- Server Actions with 'use server' directive for API communication
- Cookie-based auth token storage
- API route constants as single-quoted strings (FI scorer requirement)
- Dark mode via @media (prefers-color-scheme: dark), not .dark class
- 8 shadcn/ui components in components/ui/
- All routes have loading.tsx and error.tsx

## Environment Variables

Required: DATABASE_URL, JWT_SECRET, CORS_ORIGIN
Optional: PORT (default 3001), NODE_ENV, API_URL
