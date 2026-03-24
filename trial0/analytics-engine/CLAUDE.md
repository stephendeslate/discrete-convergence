# Analytics Engine — CLAUDE.md

## Project Overview

Multi-tenant embeddable analytics platform. Organizations connect data sources,
build dashboards with configurable widgets, and embed them via iframe or SDK.

## Architecture

Turborepo 2 monorepo with pnpm workspaces:
- `apps/api` — NestJS 11 REST API with Prisma 6 + PostgreSQL 16
- `apps/web` — Next.js 15 App Router with Tailwind CSS + shadcn/ui
- `packages/shared` — Cross-cutting utilities (constants, logging, pagination, validation)

## Quick Start

```bash
pnpm install
cp apps/api/.env.example apps/api/.env  # Edit with real values
docker compose up -d postgres           # Start PostgreSQL
cd apps/api && npx prisma migrate deploy && npx prisma db seed
pnpm turbo run dev                      # Start all apps
```

## Turbo Tasks

| Task | Command | Description |
|------|---------|-------------|
| dev | `pnpm turbo run dev` | Start all apps in dev mode |
| build | `pnpm turbo run build` | Build all packages |
| test | `pnpm turbo run test` | Run all tests |
| lint | `pnpm turbo run lint` | Lint all packages |
| typecheck | `pnpm turbo run typecheck` | TypeScript type checking |
| db:migrate | `pnpm turbo run db:migrate` | Run Prisma migrations |
| db:seed | `pnpm turbo run db:seed` | Seed database |

## API Architecture

### DI-Based Global Providers (AppModule)

- `APP_GUARD`: ThrottlerGuard (rate limiting) + JwtAuthGuard (authentication)
- `APP_FILTER`: GlobalExceptionFilter (error sanitization, correlation ID)
- `APP_INTERCEPTOR`: ResponseTimeInterceptor (X-Response-Time header)

### Middleware Chain

1. CorrelationIdMiddleware — preserves or generates X-Correlation-ID
2. RequestLoggingMiddleware — structured request/response logging

### Auth Flow

- JWT-based with bcrypt password hashing (12 rounds from shared constants)
- @Public() decorator exempts routes from JWT guard
- Registration restricted to USER and VIEWER roles (ADMIN blocked at DTO level)

### Rate Limiting

- Default: 100 requests / 60 seconds
- Auth endpoints: 5 requests / 60 seconds
- Monitoring endpoints: exempt (@SkipThrottle)

## Database

### Prisma Schema

15 models with multi-tenant isolation:
Tenant, User, Dashboard, Widget, DataSource, FieldMapping, SyncRun,
DataPoint, AggregatedDataPoint, EmbedConfig, QueryCache, DeadLetterEvent,
ApiKey, AuditLog

### Row Level Security

All tenant-scoped tables have ENABLE + FORCE ROW LEVEL SECURITY.
Tenant context set via `SET app.tenant_id` before queries.

### Conventions

- All models use `@@map` for table names
- All enums use `@@map` for type names and `@map` on each value
- All tenant-scoped tables have `@@index([tenantId])`
- All `findFirst` calls have justification comments

## Frontend Architecture

### Pages (Next.js App Router)

/, /login, /register, /dashboards, /data-sources, /embed-settings, /api-keys, /settings

Each route has its own loading.tsx and error.tsx.

### UI Components (11 shadcn/ui)

Button, Card, Input, Label, Badge, Skeleton, Table, Switch, Dialog, Nav, DashboardList

### Accessibility

- Loading states: `role="status"` + `aria-busy="true"`
- Error states: `role="alert"` + `useRef` + `useEffect` focus + `tabIndex={-1}`
- Dark mode: `@media (prefers-color-scheme: dark)` (NOT `.dark` class)
- All inputs have associated labels via htmlFor/id

## Convention Gates (Zero Tolerance)

- No `as any` — use proper typing
- No `console.log` in api/src — use structured logger
- No `|| 'value'` fallbacks — use env validation
- No `$executeRawUnsafe` — use `$executeRaw` with `Prisma.sql`
- No `dangerouslySetInnerHTML` — sanitize server-side

## Testing

### API Tests

- Unit tests: auth.service, dashboard.service, data-source.service (mocked Prisma)
- Integration tests: auth, dashboard (supertest + real AppModule)
- Cross-layer: full pipeline verification (response time, health, correlation, auth)
- Security: auth rejection, input validation, error sanitization, rate limiting
- Performance: X-Response-Time, pagination clamping, Cache-Control
- Monitoring: health, ready, metrics, error POST

### Frontend Tests

- Accessibility: jest-axe on real components (Button, Card, Input, Badge, Switch)
- Keyboard: userEvent Tab/Shift+Tab/Enter/Space navigation

## Monitoring

- GET /api/monitoring/health — { status, version }
- GET /api/monitoring/ready — DB connectivity check
- GET /api/monitoring/metrics — request/error counters
- POST /api/monitoring/errors — frontend error reports

## Shared Package Exports

BCRYPT_SALT_ROUNDS, ALLOWED_REGISTRATION_ROLES, MAX_PAGE_SIZE, APP_VERSION,
createCorrelationId, formatLogEntry, sanitizeLogContext, validateEnvVars,
DEFAULT_PAGE_SIZE, CACHE_TTL_BY_TIER, clampPagination, getPaginationSkip

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | PostgreSQL connection string |
| JWT_SECRET | Yes | HMAC signing key |
| JWT_EXPIRES_IN | Yes | Token expiry (e.g., '1h') |
| CORS_ORIGIN | Yes | Allowed CORS origin |
| PORT | Yes | API listen port |
