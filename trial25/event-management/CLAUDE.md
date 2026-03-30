# Event Management Platform

## Architecture
- **Monorepo**: pnpm workspaces + Turborepo
- **API**: NestJS 11, Prisma 6, PostgreSQL 16
- **Web**: Next.js 15 (App Router), Tailwind CSS v4
- **Shared**: @repo/shared package with utilities

## Key Commands
```bash
pnpm install          # Install all dependencies
pnpm build            # Build all packages
pnpm lint             # Lint all packages
pnpm test             # Run all tests
pnpm typecheck        # Type check all packages
```

## API Commands (from apps/api)
```bash
pnpm test             # Run Jest tests
pnpm build            # Build NestJS app
pnpm start:dev        # Start dev server
```

## Web Commands (from apps/web)
```bash
pnpm test             # Run Jest tests
pnpm build            # Build Next.js app
pnpm dev              # Start dev server
```

## Critical Patterns
- **bcryptjs** (NOT bcrypt), salt rounds = 12
- **ThrottlerModule** limit: 100000 in AppModule
- **Login throttle**: `@Throttle(LOGIN_THROTTLE_CONFIG)` where config = `{ default: { ttl: 60000, limit: 10 } }`
- **PORT**: `process.env['PORT'] ?? '3001'` (no `||` patterns)
- **Health endpoints**: /health and /health/ready (NOT /monitoring/health)
- **ESLint 9**: flat config via eslint.config.mjs
- **ValidationPipe**: `forbidNonWhitelisted: true`
- **@MaxLength()** on all string DTOs, **@MaxLength(36)** on UUID fields
- **Helmet**: CSP directives in main.ts
- **RLS**: ENABLE + FORCE + CREATE POLICY on all tenanted tables
- **PrismaService.setTenantContext**: uses `$executeRaw` (parameterized, not $executeRawUnsafe)
- **findFirst()**: every call has justification comment
- **No `as any`** casts in source code
- **No `console.log`** in API src (use Logger)
- **TRACED tags**: only in .ts/.tsx files
- **VERIFY tag prefix**: EM

## Project Structure
```
apps/api/           # NestJS 11 API
  src/
    auth/           # Auth module (register, login, refresh)
    event/          # Event CRUD + publish/cancel
    venue/          # Venue CRUD
    ticket/         # Ticket CRUD + cancel/refund
    attendee/       # Attendee CRUD + register/checkIn
    speaker/        # Speaker CRUD
    session/        # Session CRUD + confirm/cancel
    sponsor/        # Sponsor CRUD
    monitoring/     # Health, readiness, metrics
    common/         # Guards, filters, interceptors, utils
    infra/          # PrismaService, PrismaModule
  test/             # Integration tests
  prisma/           # Schema + migrations
apps/web/           # Next.js 15 frontend
  app/              # App router pages
  components/       # 9 React components
  lib/              # api.ts, actions.ts, utils.ts
packages/shared/    # Shared utilities
specs/              # Specification documents
```
