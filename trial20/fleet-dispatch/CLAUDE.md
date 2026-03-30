# Fleet Dispatch — Project Instructions

## Project Type
Multi-tenant fleet/vehicle dispatch management system.
NestJS 11 backend, Next.js 15 frontend, Prisma ORM, PostgreSQL.

## Monorepo Structure
- `apps/api/` — NestJS 11 backend API
- `apps/web/` — Next.js 15 frontend
- `packages/shared/` — shared constants, utilities, types
- `specs/` — specification documents

## Package Manager
pnpm with workspace protocol. Turborepo for build orchestration.
pnpm.overrides: effect>=3.20.0 (Prisma transitive dependency).

## Build Commands
```bash
pnpm install
cd apps/api && npx prisma generate
pnpm turbo run build
pnpm turbo run test
pnpm turbo run lint
```

## Key Technical Decisions

### Authentication
- JWT with access (1h) and refresh (7d) tokens
- bcryptjs (NOT bcrypt) with BCRYPT_SALT_ROUNDS=12
- No ADMIN self-registration (ALLOWED_REGISTRATION_ROLES)
- @Throttle on login/register (10 req/s)

### Guards (APP_GUARD chain)
1. ThrottlerGuard — rate limiting
2. JwtAuthGuard — JWT validation (skip with @Public())
3. RolesGuard — RBAC (skip when no @Roles())

### Database
- Prisma >=6.0.0 <7.0.0
- PostgreSQL with RLS on all tables
- tenantId as TEXT (not UUID)
- Decimal(12,2) for money fields
- @@map/@@index on all models
- No $executeRawUnsafe — use Prisma.sql template

### API Patterns
- All list endpoints return { data, total, page, limit }
- Delete operations restricted to ADMIN role
- Cache-Control: private, max-age=30 on list endpoints
- Dispatches include vehicle/route/driver relations (N+1 prevention)

### Frontend
- Next.js 15 App Router with server actions
- httpOnly cookies for token storage (not localStorage)
- 8 shadcn/ui-style components in components/ui/
- Tailwind CSS with dark mode via prefers-color-scheme
- Every route has loading.tsx and error.tsx

### Logging
- pino structured JSON logging (NO console.log)
- sanitizeLogContext strips passwords/tokens from logs
- X-Correlation-ID propagated through requests
- X-Response-Time header on all responses

### Security
- helmet with CSP (frameAncestors: none)
- x-powered-by disabled
- ValidationPipe: whitelist + forbidNonWhitelisted
- CORS restricted to CORS_ORIGIN env var

## Code Quality Rules
- Zero `as any` usage
- Zero `console.log` usage
- Zero `|| 'fallback'` for env vars (use ?? operator)
- Zero `$executeRawUnsafe` calls
- ESLint 9 flat config (eslint.config.mjs)
- Jest with collectCoverage and json-summary reporter
- Co-located unit tests (*.spec.ts) in src/ directories

## VERIFY/TRACED Tags
- Format: `VERIFY: FD-{DOMAIN}-{NNN} — Description` (plain text)
- TRACED tags only in .ts/.tsx source files
- 43 tag pairs covering all domains

## Domain Entities
- Vehicles: fleet inventory with status and cost tracking
- Routes: origin/destination with distance and time estimates
- Drivers: driver records with license and availability
- Dispatches: assignments linking vehicles, routes, drivers
- Users: auth accounts with role and tenant membership

## Roles
- ADMIN: full CRUD including delete
- DISPATCHER: read + create + update
- VIEWER: read only

## Environment Variables
- DATABASE_URL: PostgreSQL connection string
- JWT_SECRET: access token signing key
- JWT_REFRESH_SECRET: refresh token signing key
- PORT: API port (default 3001)
- CORS_ORIGIN: allowed CORS origin
- API_URL: backend URL for frontend
- NODE_ENV: runtime environment
