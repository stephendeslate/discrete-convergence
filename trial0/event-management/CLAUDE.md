# Event Management — CLAUDE.md

## Architecture

Turborepo 2 monorepo with pnpm workspaces:
- `apps/api` — NestJS 11 REST API with Prisma 6 + PostgreSQL 16
- `apps/web` — Next.js 15 with App Router, React 19, Tailwind CSS 4
- `packages/shared` — Constants, utilities, and types shared across apps

## Quick Start

```bash
pnpm install
cp .env.example .env
docker compose up -d postgres
pnpm --filter api exec prisma migrate deploy
pnpm --filter api exec prisma db seed
pnpm turbo dev
```

API runs on http://localhost:4000, Web on http://localhost:3000.

## Turbo Tasks

- `pnpm turbo build` — Build all packages
- `pnpm turbo dev` — Start dev servers
- `pnpm turbo lint` — Run ESLint
- `pnpm turbo test` — Run all tests
- `pnpm turbo typecheck` — Type checking

## API Architecture

### Global Providers (AppModule DI)
- `APP_GUARD` → ThrottlerGuard (rate limiting) + JwtAuthGuard (authentication)
- `APP_FILTER` → GlobalExceptionFilter (structured error responses)
- `APP_INTERCEPTOR` → ResponseTimeInterceptor (X-Response-Time header)

### Modules
- **AuthModule** — Register, login, refresh with JWT + bcrypt
- **EventModule** — CRUD, publish/cancel workflows, public discovery
- **VenueModule** — Venue directory with capacity tracking
- **RegistrationModule** — Atomic registration with capacity checks
- **CheckInModule** — Idempotent check-in with stats
- **NotificationModule** — Broadcast with rate limiting
- **AuditModule** — Compliance audit trail
- **MonitoringModule** — Health, metrics, request tracking

### Route Protection
All routes require JWT by default. Use `@Public()` decorator to exempt routes.
Public routes: POST /auth/register, POST /auth/login, GET /events/public, GET /events/slug/:slug, GET /monitoring/health.

## Database

### Prisma Schema
- 14 models, 7 enums — all with `@@map` (snake_case table names)
- Enum values use `@map` for snake_case DB representation
- Composite indexes on `[tenantId, status]`, `[tenantId, email]`

### Row Level Security
RLS enabled + forced on: users, events, venues, audit_logs.
Uses `current_setting('app.tenant_id')` for tenant isolation.

### Migrations
Single initial migration at `apps/api/prisma/migrations/20240101000000_init/`.
Includes RLS policy creation via raw SQL.

### Seed
Creates: 1 org, 3 users (admin/organizer/attendee), 1 venue, 3 events, ticket types, sessions, registrations, notifications, audit logs. Error-handling wraps entire seed in try/catch.

## Frontend

### Components (11 shadcn/ui)
button, card, input, label, badge, skeleton, table, switch, dialog, nav, event-card.
All use `cn()` from `lib/utils.ts` (clsx + tailwind-merge).

### Routes (8)
/, /login, /register, /events, /venues, /discover, /notifications, /settings.
Each route has page.tsx + loading.tsx + error.tsx.

### Dark Mode
CSS custom properties with `@media (prefers-color-scheme: dark)` — NOT `.dark` class.

### Loading States
`role="status"` + `aria-busy="true"` on all loading skeletons.

### Error States
`role="alert"` + `useRef<HTMLDivElement>` + `useEffect` focus + `tabIndex={-1}`.

## Convention Gates

- Zero `as any` — use proper types
- Zero `console.log` in api/src — use LoggerService
- Zero `|| 'value'` fallbacks — use `??` or explicit defaults
- Zero `$executeRawUnsafe` — use parameterized queries
- Zero `dangerouslySetInnerHTML` — use React rendering
- All `findFirst` calls have justification comments

## Testing

### Unit Tests (3)
- `auth.service.spec.ts` — Register, login, refresh
- `event.service.spec.ts` — CRUD, publish, cancel, status transitions
- `registration.service.spec.ts` — Register, cancel, duplicate check, capacity

### Integration Tests (6)
- `auth.integration.spec.ts` — Full auth flow
- `event.integration.spec.ts` — Event lifecycle
- `cross-layer.integration.spec.ts` — Auth → Event → Registration
- `monitoring.spec.ts` — Health and metrics endpoints
- `security.spec.ts` — Unauthorized access, CORS, throttle
- `performance.spec.ts` — Response time assertions

### Frontend Tests
- `accessibility.spec.tsx` — jest-axe on all major components
- `keyboard.spec.tsx` — Tab, Shift+Tab, Enter, Space, disabled skip

## Monitoring

- Correlation IDs via X-Correlation-ID header (UUID v4)
- Structured JSON logging with formatLogEntry from shared
- Log sanitization strips password, token, secret, authorization
- Response time tracking via interceptor
- Health: GET /monitoring/health — uptime, memory, DB status
- Metrics: GET /monitoring/metrics — request/error counts, percentiles

## Shared Package Exports (8+)

BCRYPT_SALT_ROUNDS, ALLOWED_REGISTRATION_ROLES, MAX_PAGE_SIZE, APP_VERSION,
createCorrelationId, formatLogEntry, sanitizeLogContext, validateEnvVars.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| DATABASE_URL | PostgreSQL connection string | Yes |
| JWT_SECRET | Secret for JWT signing | Yes |
| JWT_EXPIRES_IN | Token expiration (e.g., "1h") | No |
| CORS_ORIGIN | Allowed CORS origin | No |
| PORT | API server port | No |
