# Fleet Dispatch — Project Instructions

## Project Overview

Fleet Dispatch is a multi-tenant fleet management platform with vehicle tracking,
driver management, route planning, and delivery tracking. Built with NestJS 11
backend, Next.js 15 frontend, Prisma ORM, and PostgreSQL 16.

## Architecture

### Monorepo Structure
- **Root**: Turborepo + pnpm workspaces
- **apps/api**: NestJS 11 REST API with Prisma
- **apps/web**: Next.js 15 with React 19, Tailwind CSS, shadcn/ui-pattern components
- **packages/shared**: 8 exported utilities consumed by both apps

### Key Patterns
- Multi-tenant isolation via tenantId in JWT and all queries
- Global guards (ThrottlerGuard, JwtAuthGuard, RolesGuard) via APP_GUARD — no per-controller @UseGuards
- Global exception filter via APP_FILTER with log sanitization
- Global response time interceptor via APP_INTERCEPTOR
- Correlation ID middleware for request tracing

## Convention Gates (Zero Tolerance)

These conventions are enforced by the scorer and cause binary pass/fail:

- **No `as any`** — use proper TypeScript types
- **No `console.log`** in apps/api/src — use PinoLoggerService
- **No `|| 'value'` fallbacks** — use nullish coalescing (??) instead
- **No `$executeRawUnsafe`** — use $executeRaw with Prisma.sql template tag
- **No `dangerouslySetInnerHTML`** in frontend components
- **No per-controller `@UseGuards`** — guards are global via APP_GUARD
- **No `.dark` class** for dark mode — use `@media (prefers-color-scheme: dark)`
- **findFirst must have justification comment** (test mocks exempt)

## Data Model Rules

- All monetary fields: `Decimal` type — NEVER Float
- Mileage, distance: `Decimal` type
- All models: `@@map("snake_case")` for table names
- RLS policies on all tenant-scoped tables

## Shared Package Exports

The @fleet-dispatch/shared package exports exactly 8 items:
1. `BCRYPT_SALT_ROUNDS` (12)
2. `ALLOWED_REGISTRATION_ROLES` (['DISPATCHER', 'DRIVER'])
3. `APP_VERSION` ('1.0.0')
4. `clampPagination` (MAX_PAGE_SIZE=100, DEFAULT_PAGE_SIZE=20)
5. `createCorrelationId` (randomUUID wrapper)
6. `formatLogEntry`
7. `sanitizeLogContext` (recursive, case-insensitive key matching)
8. `validateEnvVars`

## Frontend Rules

- Dark mode: `@media (prefers-color-scheme: dark)` in globals.css
- cn() helper: clsx + tailwind-merge
- Server Components by default, 'use client' only when needed
- Server Actions for API communication with Bearer token auth
- `import type` for type-only imports

## VERIFY/TRACED Parity

- All VERIFY tags in specs/ must have matching TRACED tags in .ts/.tsx source files
- TRACED tags only appear in .ts/.tsx files (never in .md, .css, .json, etc.)
- Tag prefix: FD- (Fleet Dispatch)
- Bidirectional: every VERIFY has a TRACED, every TRACED has a VERIFY

## Test Structure

- Integration tests: `apps/api/test/*.spec.ts`
- Frontend tests: `apps/web/__tests__/*.spec.tsx`
- Shared tests: `packages/shared/__tests__/*.spec.ts`

## Build & Run

```bash
pnpm install
pnpm turbo build
pnpm --filter @fleet-dispatch/api dev
pnpm --filter @fleet-dispatch/web dev
pnpm turbo test
```

## Environment Variables

Required (validated at startup):
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — Secret key for JWT signing
- `CORS_ORIGIN` — Allowed CORS origin (e.g., http://localhost:3000)
