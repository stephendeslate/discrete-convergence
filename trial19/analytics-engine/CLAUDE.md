# Analytics Engine

Multi-tenant analytics dashboard platform built with NestJS 11, Next.js 15, and PostgreSQL.

## Version
APP_VERSION: 1.0.0

## Architecture
- **apps/api** — NestJS 11 backend with Prisma ORM, JWT auth, RBAC, tenant isolation
- **apps/web** — Next.js 15 frontend with App Router, shadcn/ui, server actions
- **packages/shared** — Shared constants, utilities, validators, sanitizers

## Commands
- `pnpm install` — Install dependencies
- `pnpm turbo run build` — Build all packages
- `pnpm turbo run test` — Run all tests
- `pnpm turbo run lint` — Lint all packages
- `pnpm turbo run typecheck` — TypeScript checks

### Single-Package Commands
- `pnpm turbo run test --filter=api` — Run API tests only
- `pnpm turbo run test --filter=web` — Run web tests only
- `pnpm turbo run test --filter=shared` — Run shared tests only
- `pnpm turbo run build --filter=api` — Build API only
- `pnpm turbo run build --filter=web` — Build web only

### Database Commands
- `cd apps/api && npx prisma generate` — Generate Prisma client
- `cd apps/api && npx prisma migrate deploy` — Run migrations
- `cd apps/api && npx prisma db seed` — Seed database

## Key Conventions
- bcryptjs (not bcrypt) for password hashing
- Prisma pinned >=6.0.0 <7.0.0
- ESLint 9 flat config (eslint.config.mjs)
- Zero `as any`, zero `console.log` in app source
- All DTOs: @IsString() + @MaxLength() for string fields
- RLS on all tenant tables via migration
- ThrottlerGuard + JwtAuthGuard + RolesGuard as APP_GUARD
- GlobalExceptionFilter as APP_FILTER
- ResponseTimeInterceptor as APP_INTERCEPTOR
- pnpm.overrides for effect>=3.20.0 (Prisma transitive fix)

## Authentication
- JWT tokens expire in 1 hour
- bcryptjs with BCRYPT_SALT_ROUNDS (12) from shared package
- No hardcoded secret fallbacks for JWT_SECRET
- ADMIN role excluded from self-registration
- validateEnvVars called at startup for DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET
- Login and register rate-limited to 3 req/sec via @Throttle override

## Database
- PostgreSQL 16 with Prisma ORM
- Row Level Security (RLS) on all tenant tables
- Migration uses TEXT comparison for tenant_id (no ::uuid cast)
- Seed creates tenant, admin, viewer, and error state data (archived dashboard)
- All models use @@map for snake_case table names
- Composite indexes on tenantId + status/type/dashboardId

## API Structure
- Controllers extract tenantId from req.user (JWT payload)
- findFirst justified with comments for non-PK lookups
- All list endpoints use parsePagination from shared with MAX_PAGE_SIZE
- Cache-Control: no-store on all GET responses
- @Roles('ADMIN') on destructive operations (DELETE)

## Frontend
- Next.js 15 App Router with server actions
- shadcn/ui components (button, card, input, badge, tabs, label, skeleton, separator)
- cn() utility using clsx + tailwind-merge
- Cookie-based token storage via server actions (httpOnly, secure)
- Error boundaries with role="alert" and focus management (useRef + tabIndex={-1})
- Loading states with Skeleton components and role="status" aria-busy="true"
- useActionState for form handling with error display

## Infrastructure
- Docker multi-stage build (deps, build, production)
- Dockerfile runs prisma generate before build
- HEALTHCHECK on /health endpoint
- docker-compose with PostgreSQL healthcheck
- PORT environment variable configurable (default 3001)
- enableShutdownHooks for graceful shutdown
- USER node in Dockerfile for non-root container

## Monitoring
- Health endpoint at /health (@Public, NO @SkipThrottle)
- Readiness check at /health/ready (database connectivity)
- Metrics at /health/metrics (request count, errors, response time)
- Correlation ID middleware (X-Correlation-ID header)
- Structured JSON logging with pino
- Request logging with duration and correlation IDs
- Log sanitization redacts password, token, secret, authorization keys

## Security
- Helmet with CSP (frame-ancestors: 'none')
- x-powered-by disabled
- CORS from CORS_ORIGIN env var
- GlobalExceptionFilter: no stack traces in responses
- All error responses include correlationId
- ValidationPipe with whitelist + forbidNonWhitelisted + transform

## Testing
- Co-located unit tests in src/{module}/*.spec.ts with behavioral assertions
- Integration tests in apps/api/test/
- Frontend accessibility tests with jest-axe
- Frontend keyboard navigation tests
- Jest with ts-jest transform
- json-summary coverage reporter for CI
- Mock Prisma service for unit tests
- autocannon in devDependencies for load testing

## Spec Traceability
- 62 VERIFY tags across 10 spec documents
- 62 TRACED tags in .ts/.tsx source files
- Bidirectional parity: 100%, zero orphans
- TRACED tags only appear in .ts/.tsx files
- Tag format: AE-{DOMAIN}-{NNN}
