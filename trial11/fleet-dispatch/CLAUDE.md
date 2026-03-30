# Fleet Dispatch — Project Instructions

## Architecture

Fleet Dispatch is a multi-tenant fleet/vehicle dispatch management system built as a
Turborepo + pnpm workspaces monorepo with three packages:

- **apps/api** — NestJS 11 REST API with JWT auth, RBAC, Prisma ORM, PostgreSQL
- **apps/web** — Next.js 15 frontend with server actions, React 19, Tailwind CSS 4, shadcn/ui
- **packages/shared** — Shared constants, utilities (pagination, correlation IDs, log sanitizer)

## Quick Start

```bash
pnpm install
cp .env.example .env
# Start PostgreSQL (docker-compose up db -d)
cd apps/api && pnpm prisma migrate deploy && pnpm prisma db seed
pnpm turbo run build
pnpm turbo run dev
```

## Development Commands

```bash
pnpm turbo run build       # Build all packages
pnpm turbo run test        # Run all tests
pnpm turbo run lint        # Lint all packages
pnpm turbo run typecheck   # TypeScript type checking
pnpm turbo run dev         # Start dev servers
```

## Testing

- **API unit tests**: `cd apps/api && pnpm test`
- **API integration tests**: Use supertest with mocked PrismaService
- **Web tests**: `cd apps/web && pnpm test` (jest-axe accessibility, keyboard navigation)
- **Shared tests**: `cd packages/shared && pnpm test`

All test files use the `*.spec.ts` or `*.spec.tsx` extension.

## Authentication & Authorization

- JWT-based auth with bcryptjs password hashing (BCRYPT_SALT_ROUNDS=12 from shared)
- Three roles: ADMIN, DISPATCHER, DRIVER
- Registration restricted to DISPATCHER and DRIVER roles only
- Global guards registered via APP_GUARD: ThrottlerGuard, JwtAuthGuard, RolesGuard
- @Public() decorator exempts auth/health/monitoring endpoints
- @Roles('ADMIN') protects delete endpoints

## Multi-Tenancy

- Every request carries tenantId in JWT payload
- All service methods accept tenantId as first parameter
- All queries include `where: { tenantId }` scoping
- Database-level RLS policies enforce tenant isolation
- Monitoring endpoints are @Public() and not tenant-scoped

## API Conventions

- Controllers extract tenant from `@Req() req.user.tenantId`
- Services use findFirst (not findUnique) for tenant-scoped lookups
- Pagination: MAX_PAGE_SIZE=100, DEFAULT_PAGE_SIZE=20, clamped via shared utility
- Correlation IDs propagated via X-Correlation-ID header
- Response times tracked via X-Response-Time header
- Errors sanitized via GlobalExceptionFilter (no stack traces exposed)

## Database

- Prisma ORM with PostgreSQL
- Schema at `apps/api/prisma/schema.prisma`
- Migrations at `apps/api/prisma/migrations/`
- All models use @@map for snake_case table names
- All enums use @@map with @map on values
- Monetary fields use Decimal @db.Decimal(12, 2), never Float
- RLS uses TEXT comparison (no ::uuid cast)

## Frontend

- Server actions in `apps/web/lib/actions.ts` handle API communication
- JWT stored in cookies via cookies().set() on login
- All routes have loading.tsx (role="status", aria-busy) and error.tsx (role="alert", focus management)
- Dark mode via @media (prefers-color-scheme: dark) CSS variables
- 9 shadcn/ui components in components/ui/

## Security

- Helmet with CSP (default-src: 'self', frame-ancestors: 'none')
- CORS from CORS_ORIGIN env var (no fallback)
- Rate limiting: default 100/60s, auth 5/60s
- Input validation: whitelist + forbidNonWhitelisted + transform
- No console.log in API source (use Pino structured logging)
- No dangerouslySetInnerHTML in frontend
- $executeRaw with Prisma.sql template (no $executeRawUnsafe)

## Spec Traceability

- Specs in `specs/` directory with VERIFY: FD-XXX-NNN tags
- Implementation files have matching TRACED: FD-XXX-NNN tags
- TRACED tags only in .ts/.tsx files (never .css, .json, .prisma, .sql)
- Tag prefixes: AUTH, DATA, API, UI, INFRA, SEC, MON, CROSS, PERF

## Environment Variables

Required (validated at startup via validateEnvVars):
- DATABASE_URL — PostgreSQL connection string
- JWT_SECRET — JWT signing secret
- CORS_ORIGIN — Allowed CORS origin

## Dependencies

- pnpm.overrides in root package.json: effect>=3.20.0 (fixes Prisma transitive vulnerability)
- bcryptjs (not bcrypt) to eliminate native compilation and tar vulnerability chain
- Prisma >=6.0.0 <7.0.0
