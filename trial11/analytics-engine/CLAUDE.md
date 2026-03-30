# Analytics Engine — Project Instructions

## Overview

Multi-tenant analytics dashboard platform built with CED v1.2-dc methodology.
Trial 11 of the discrete-convergence experiment. Full-stack monorepo with
NestJS API, Next.js frontend, and shared utility package.

## Architecture

Turborepo + pnpm workspaces monorepo:

```
analytics-engine/
  apps/api/        — NestJS 11 REST API (TypeScript strict)
  apps/web/        — Next.js 15 + React 19 frontend
  packages/shared/ — Constants, utilities, validators
```

- **Database**: PostgreSQL 16 with Prisma ORM (>=6.0.0 <7.0.0)
- **Auth**: JWT with bcryptjs (salt rounds: 12)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Package manager**: pnpm with workspaces
- **Build system**: Turborepo with cached pipelines

## Domain Entities

- **User**: email, passwordHash, role (ADMIN/USER/VIEWER), tenantId
- **Dashboard**: name, description, tenantId — owned by tenant
- **DataSource**: name, type (POSTGRESQL/MYSQL/REST_API/CSV), connectionString, tenantId
- **Widget**: title, type (CHART/TABLE/METRIC/MAP), config (JSON), dashboardId, dataSourceId

All entities have tenantId for row-level security. RLS policies enforce
tenant isolation at the database level using `current_setting('app.tenant_id')`.

## Key Design Decisions

- **bcryptjs** (not bcrypt) to avoid native tar vulnerability chain
- **pnpm.overrides** for `effect>=3.20.0` to fix Prisma transitive vulnerability
- **@Public() decorator** exempts auth and health routes from JWT guard
- **APP_GUARD registration order**: ThrottlerGuard, JwtAuthGuard, RolesGuard
- **No @UseGuards(JwtAuthGuard)** on domain controllers — global guard handles it
- **Monitoring endpoints** are all @Public() (system-wide, no tenant scoping)
- **RLS policies** use TEXT comparison (no ::uuid cast) since tenantId is TEXT
- **APP_VERSION** = '1.0.0' from shared package, used in health endpoint and settings page

## Code Conventions

- TypeScript strict mode in all packages
- No `as any` casts
- No `console.log` in production code (use Pino structured logging)
- No `||` fallbacks for defaults (use `??` nullish coalescing)
- All DTOs use class-validator decorators (@IsString, @MaxLength, @IsOptional, etc.)
- ValidationPipe: whitelist + forbidNonWhitelisted + transform
- Every findFirst has a justification comment
- Frontend error boundaries: role="alert", useRef, focus on mount
- Loading states: role="status", aria-busy="true", Skeleton components

## Testing Strategy

- **Unit tests**: Service-level tests with mocked Prisma, behavioral assertions
- **Integration tests**: Supertest-based endpoint tests with full NestJS app
- **Cross-layer**: Full pipeline test (auth -> CRUD -> error -> correlation -> health -> RBAC)
- **Accessibility**: jest-axe automated a11y checks on all pages
- **Keyboard**: Tab navigation, Enter/Space activation via @testing-library/user-event
- **Security**: JWT validation, RBAC enforcement, input validation, public route access
- **Performance**: Response time header, pagination clamping, defaults
- **Shared package**: Log sanitizer (arrays, nested objects, case-insensitive keys)

## Environment Variables

Required (validated at startup via validateEnvVars):
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — Secret key for JWT signing
- `CORS_ORIGIN` — Allowed CORS origin

Optional:
- `PORT` — API server port (default: 3000)
- `API_URL` — Backend URL for frontend server actions (default: http://localhost:3000)
- `NODE_ENV` — Environment mode (development/production/test)

## Commands

```bash
pnpm install                    # Install all dependencies
pnpm turbo run build            # Build all packages
pnpm turbo run test             # Run all tests
pnpm turbo run lint             # Lint all packages
pnpm turbo run typecheck        # TypeScript type checking
pnpm --filter api prisma migrate deploy   # Run migrations
pnpm --filter api prisma db seed          # Seed database
```

## VERIFY/TRACED Tag Conventions

- Tags follow format: `AE-{DOMAIN}-{NNN}` (e.g., AE-AUTH-001)
- **VERIFY** tags: ONLY in spec files (`specs/*.md`)
- **TRACED** tags: ONLY in source files (`.ts`, `.tsx`)
- Each VERIFY must have exactly one matching TRACED
- Spec index: `specs/SPEC-INDEX.md`
- Total bidirectional pairs: 70
