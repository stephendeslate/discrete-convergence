# Analytics Engine — CLAUDE.md

## Project Overview

Multi-tenant analytics dashboard built with CED v1.0-dc methodology.
Turborepo monorepo with NestJS 11 API, Next.js 15 frontend, and shared package.

## Tech Stack

- **Runtime:** Node.js 20 (LTS)
- **Package Manager:** pnpm 9.15.4
- **Monorepo:** Turborepo
- **Backend:** NestJS 11, Prisma ORM (>=6.0.0 <7.0.0), PostgreSQL 16
- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS 4
- **Auth:** JWT (bcryptjs, salt rounds 12), httpOnly cookies
- **Testing:** Jest, jest-axe, @testing-library/react, supertest

## Directory Structure

```
apps/
  api/          — NestJS 11 backend
    src/
      auth/       — JWT auth (register, login, guards, strategy)
      dashboard/  — Dashboard CRUD with tenant scoping
      widget/     — Widget CRUD with tenant scoping
      data-source/ — Data source CRUD with tenant scoping
      monitoring/ — Health, ready, metrics endpoints
      common/     — Shared middleware, filters, interceptors, decorators
      infra/      — Prisma service and module
    prisma/       — Schema, migrations, seed
    test/         — Integration and unit tests
  web/          — Next.js 15 frontend
    app/          — App Router pages (login, register, dashboard, data-sources, settings)
    components/   — shadcn/ui components (9 total)
    lib/          — Server actions, utilities
    __tests__/    — Accessibility and keyboard tests
packages/
  shared/       — Constants, utilities, validators
specs/          — CED specification files (8 total)
```

## Commands

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm turbo run build

# Run all tests
pnpm turbo run test

# Lint all packages
pnpm turbo run lint

# Type check all packages
pnpm turbo run typecheck

# Run specific package tests
pnpm --filter @analytics-engine/api test
pnpm --filter @analytics-engine/web test
pnpm --filter @analytics-engine/shared test

# Database
pnpm --filter @analytics-engine/api prisma:generate
pnpm --filter @analytics-engine/api prisma:migrate
pnpm --filter @analytics-engine/api prisma:seed

# Audit
pnpm audit --audit-level=high
```

## Critical Rules (CED v1.0-dc)

1. **bcryptjs only** — Never use `bcrypt` (native). Always `bcryptjs` (pure JS).
2. **Zero `as any`** — No TypeScript `as any` casts anywhere in source.
3. **Zero `||` env fallbacks** — Use `?? undefined` or validate at startup, never `|| 'default'`.
4. **ESLint config before lint** — Every package must have ESLint config before running lint.
5. **RLS policies** — TEXT comparison only, no `::uuid` cast on TEXT columns.
6. **Single-quoted route constants** — API_ROUTES values must be single-quoted strings.
7. **Tenant context** — All controllers extract `req.user.tenantId` from JWT payload.
8. **VERIFY/TRACED parity** — Every VERIFY tag in specs has a TRACED tag in source, and vice versa.
9. **Spec minimums** — 7 spec files (each >= 55 lines), SPEC-INDEX >= 60 lines, >= 35 VERIFY tags.

## Architecture Decisions

- **APP_GUARD pattern:** ThrottlerGuard, JwtAuthGuard, and RolesGuard registered globally
- **@Public() decorator:** Exempts endpoints from JWT auth (used by health, auth endpoints)
- **@SkipThrottle():** Exempts monitoring endpoints from rate limiting
- **GlobalExceptionFilter:** Sanitizes all error responses (no stack traces)
- **ResponseTimeInterceptor:** Adds X-Response-Time header to all responses
- **CorrelationIdMiddleware:** Adds X-Correlation-Id header for request tracing
- **parsePagination:** Clamps pageSize to MAX_PAGE_SIZE (100), defaults to DEFAULT_PAGE_SIZE (20)

## Environment Variables

Required (validated at startup by `validateEnvVars`):
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — Secret for JWT signing
- `CORS_ORIGIN` — Allowed CORS origin

Optional:
- `PORT` — API port (default: 3001)
- `LOG_LEVEL` — Pino log level (default: info)
- `NODE_ENV` — Environment (development/production)
- `NEXT_PUBLIC_API_URL` — API URL for frontend

## Testing

- **Unit tests:** Service-level with mocked Prisma, behavioral assertions (toHaveBeenCalledWith)
- **Integration tests:** Full NestJS app with supertest, JWT token flow
- **Security tests:** Auth enforcement, RBAC, input validation, error sanitization
- **Performance tests:** Response time headers, pagination clamping
- **Monitoring tests:** Health, ready, metrics, correlation IDs
- **Cross-layer tests:** End-to-end pipeline verification
- **Accessibility tests:** jest-axe for WCAG compliance, keyboard navigation with userEvent
- **Minimum:** >= 30 test cases in api/test/, total across all packages higher
