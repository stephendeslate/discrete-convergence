# Analytics Engine

## Project Overview

Multi-tenant embeddable analytics platform for SaaS companies.
Built as part of Trial 3 of the Discrete Convergence Experiment.
Version: 1.0.0 (matches APP_VERSION from shared package).

## Architecture

### Monorepo Structure
- `apps/api/` — NestJS 11 backend (port 3001)
- `apps/web/` — Next.js 15 frontend (port 3000)
- `packages/shared/` — Shared constants, types, and utilities

### Tech Stack
- Backend: NestJS 11 + Prisma 6 + PostgreSQL 16
- Frontend: Next.js 15 App Router + shadcn/ui + Tailwind CSS 4
- Auth: JWT + bcrypt (salt rounds 12)
- Logger: Pino structured JSON
- Monorepo: Turborepo 2 + pnpm workspaces

## Domain Entities

### Tenant
Organization with tier (FREE/PRO/ENTERPRISE) controlling feature limits.

### User
Belongs to a tenant. Roles: ADMIN, USER, VIEWER.
ADMIN cannot self-register (enforced by ALLOWED_REGISTRATION_ROLES).

### Dashboard
Container for widgets. Status lifecycle: DRAFT -> PUBLISHED -> ARCHIVED.

### Widget
Chart/table/KPI bound to a dashboard. Types: LINE_CHART, BAR_CHART,
PIE_CHART, AREA_CHART, KPI_CARD, TABLE, FUNNEL.
Capped at 20 per dashboard (MAX_WIDGETS_PER_DASHBOARD).

### DataSource
External data connection (REST_API, POSTGRESQL, CSV, WEBHOOK).
Tier-based limits on count and sync schedules.
Auto-pauses after 5 consecutive failures.

## Key Design Decisions

### Authentication
- JWT with no secret fallback (validated at startup)
- JwtAuthGuard as APP_GUARD (no per-controller @UseGuards)
- @Public() decorator for route exemption

### Security
- Helmet CSP: default-src 'self', frame-ancestors 'none'
- ThrottlerModule: default (100/60s) + auth (5/60s) named configs
- ValidationPipe: whitelist + forbidNonWhitelisted + transform
- CORS from CORS_ORIGIN env (no fallback, credentials true)

### Monitoring
- Pino structured JSON logger (DI-injectable)
- CorrelationIdMiddleware preserves client X-Correlation-ID
- GlobalExceptionFilter as APP_FILTER with correlationId in response
- ResponseTimeInterceptor as APP_INTERCEPTOR with perf_hooks
- Health endpoints: @Public() + @SkipThrottle()

### Performance
- Pagination: clamp to MAX_PAGE_SIZE (100), default 20
- Cache-Control headers on all list endpoints
- @@index on tenantId, status, composite indexes
- Prisma include for N+1 prevention

### Frontend
- Dark mode via @media (prefers-color-scheme: dark)
- cn() utility with clsx + tailwind-merge
- Server Actions check response.ok before redirect
- All routes have loading.tsx and error.tsx

## Code Conventions

- Zero `as any` type assertions
- Zero `console.log` in apps/api/src/
- Zero `|| 'value'` env var fallback patterns
- Zero `$executeRawUnsafe` calls
- Zero `dangerouslySetInnerHTML` usage
- All findFirst calls have justification comments
- TRACED tags only in .ts/.tsx files

## Testing Strategy

- Unit tests: auth.service, dashboard.service, data-source.service (mocked Prisma)
- Integration tests: auth, dashboard (supertest with real AppModule)
- Cross-layer: full pipeline test
- Security: CSP, validation, auth enforcement
- Performance: response time, pagination, cache-control
- Monitoring: health, ready, metrics (supertest)
- Accessibility: jest-axe component tests
- Keyboard: userEvent tab/enter/space tests
- Sanitizer: nested objects, arrays, case-insensitive keys

## Environment Variables

Required: DATABASE_URL, JWT_SECRET, CORS_ORIGIN
Optional: PORT, NODE_ENV, LOG_LEVEL

## Commands

```bash
pnpm install          # Install dependencies
pnpm turbo run build  # Build all packages
pnpm turbo run test   # Run all tests
pnpm turbo run typecheck  # Type check
pnpm turbo run lint   # Lint
```

## VERIFY/TRACED Tags

- Prefix: AE-
- VERIFY tags: in specs/*.md files only
- TRACED tags: in .ts/.tsx files only
- Total tags: 36 (bidirectional parity)
