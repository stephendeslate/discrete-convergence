# Fleet Dispatch — Project Instructions

## Project Overview

Fleet Dispatch (FD) is a multi-tenant fleet and vehicle dispatch management
system. It manages vehicles, drivers, dispatches, and routes with role-based
access control and tenant isolation.

## Tech Stack

- **Backend**: NestJS 11, Prisma ORM (>=6.0.0 <7.0.0), PostgreSQL 16
- **Frontend**: Next.js 15, shadcn/ui, Tailwind CSS
- **Monorepo**: Turborepo with pnpm workspaces
- **Auth**: JWT with bcryptjs, RBAC (admin, dispatcher, viewer)
- **Testing**: Jest, supertest, jest-axe, @testing-library

## Workspace Structure

```
apps/api      — NestJS backend (port 3001)
apps/web      — Next.js frontend (port 3000)
packages/shared — Shared types, constants, utilities
```

## Commands

```bash
pnpm install                    # Install dependencies
pnpm turbo run build            # Build all packages
pnpm turbo run test             # Run all tests
pnpm turbo run lint             # Lint all packages
pnpm turbo run typecheck        # Type check all packages
pnpm --filter api test          # Run API tests only
pnpm --filter web test          # Run web tests only
pnpm --filter @fleet-dispatch/shared test  # Run shared tests only
```

## Development

```bash
docker compose up -d            # Start PostgreSQL
pnpm --filter api prisma migrate dev  # Run migrations
pnpm --filter api prisma db seed      # Seed database
pnpm turbo run dev              # Start all apps
```

## Environment Variables

Required (see .env.example):
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — Secret for JWT signing (no fallback allowed)
- `CORS_ORIGIN` — Allowed CORS origin

## Architecture Rules

### Authentication
- bcryptjs (NOT bcrypt) for password hashing
- JWT with 1h expiry, no hardcoded secret fallbacks
- Registration restricted to ALLOWED_REGISTRATION_ROLES

### Data Layer
- All Prisma models use `@@map` for table names
- All enums use `@@map` with `@map` on values
- Monetary fields: `Decimal @db.Decimal(12,2)` (never Float)
- RLS uses TEXT comparison (no `::uuid` cast)
- `findFirst` requires justification comments

### Security
- Global guards: ThrottlerGuard → JwtAuthGuard → RolesGuard
- GlobalExceptionFilter with log sanitization
- Tenant isolation in all service queries
- No `as any` casts in source code
- No `|| fallback` patterns for secrets
- No `console.log` in apps/api/src

### Monitoring
- All monitoring controller methods: @Public() + @SkipThrottle()
- Correlation IDs on every request
- Structured logging via shared formatLogEntry()
- Response time headers on all endpoints

### Frontend
- No inline fixture components in tests
- Import real page components for testing
- Token stored in cookies after login
- Auth headers via authenticatedFetch()
- Route constants with single-quoted strings

### Specifications
- VERIFY tags in spec .md files, TRACED tags in .ts/.tsx files
- Bidirectional parity required (zero orphans)
- All spec files >= 55 lines
- SPEC-INDEX.md >= 55 lines
- >= 2 cross-references between spec files

## ESLint

Uses ESLint 9 flat config format (`eslint.config.mjs`).
Do NOT create `.eslintrc.json` files.

## Testing

- >= 30 test cases in apps/api/test
- Unit tests use behavioral assertions (toHaveBeenCalledWith)
- Integration tests use supertest with real AppModule
- Frontend tests use jest-axe and @testing-library/user-event
- Type augmentations in tsconfig: jest, @testing-library/jest-dom, @types/jest-axe

## Prisma

- Version range: >=6.0.0 <7.0.0
- pnpm.overrides for effect>=3.20.0 (transitive vulnerability fix)
- Indexes on tenantId, status, and composite (tenantId, status)
- Seed script creates tenant, users (3 roles), vehicles, drivers, routes, dispatches
