# Analytics Engine — Project Instructions

## Overview

Analytics Engine is a multi-tenant embeddable analytics platform built for
Trial 4 of the discrete-convergence experiment. It enables SaaS companies to
configure data sources, build dashboards via UI, and embed branded analytics.

- **Trial:** 4
- **Layer:** L9 (all layers converged)
- **Version:** 1.0.0 (APP_VERSION from shared)

## Architecture

Turborepo monorepo with pnpm workspaces:

```
analytics-engine/
  apps/api/        — NestJS 11 backend (port 3001)
  apps/web/        — Next.js 15 frontend (port 3000)
  packages/shared/ — shared utilities (8+ consumed exports)
  specs/           — 8 specification documents
```

## Domain Entities

- **Tenant** — organization with tier (FREE/PRO/ENTERPRISE) and theme
- **User** — belongs to Tenant, roles: ADMIN/USER/VIEWER
- **Dashboard** — status: DRAFT/PUBLISHED/ARCHIVED, has many Widgets
- **Widget** — chart types: LINE/BAR/PIE/AREA/KPI/TABLE/FUNNEL
- **DataSource** — connectors: REST_API/POSTGRESQL/CSV/WEBHOOK
- **SyncRun** — status: IDLE/RUNNING/COMPLETED/FAILED
- **DataPoint** — ingested row with dimensions + metrics
- **EmbedConfig** — per-dashboard embed settings
- **ApiKey** — admin or embed key with hash and prefix
- **AuditLog** — immutable tenant action log

## Key Design Decisions

### Authentication
- JWT + bcrypt (12 salt rounds from shared)
- JwtAuthGuard as APP_GUARD (no per-controller @UseGuards)
- @Public() decorator exempts health and auth routes
- ALLOWED_REGISTRATION_ROLES excludes ADMIN

### Security
- Helmet CSP: default-src 'self', script-src 'self', frame-ancestors 'none'
- ThrottlerModule: default (100/60s) + auth (5/60s) rate limits
- ValidationPipe: whitelist + forbidNonWhitelisted + transform
- CORS: from CORS_ORIGIN env, no fallback, credentials true
- RLS: ENABLE + FORCE on all tenant-scoped tables

### Monitoring
- Pino structured JSON logger (DI-injectable)
- CorrelationIdMiddleware: preserves or generates X-Correlation-ID
- RequestLoggingMiddleware: logs method, URL, status, duration
- GlobalExceptionFilter: sanitized errors, correlationId in response
- Health endpoints: /health, /health/ready ($queryRaw), /metrics

### Performance
- ResponseTimeInterceptor as APP_INTERCEPTOR (perf_hooks)
- Pagination: clamp to MAX_PAGE_SIZE=100, DEFAULT_PAGE_SIZE=20
- Cache-Control on list endpoints
- @@index on tenantId, status, composites

### Frontend
- Next.js 15 App Router with server components
- shadcn/ui: 9 components in components/ui/
- cn() utility: clsx + tailwind-merge
- Dark mode: @media (prefers-color-scheme: dark) in globals.css
- loading.tsx: role="status" + aria-busy="true"
- error.tsx: role="alert" + useRef + focus management

## Code Conventions

### Binary Gates (zero tolerance)
- Zero `as any` type assertions
- Zero `console.log` in apps/api/src/
- Zero `|| 'value'` env var fallbacks
- Zero `$executeRawUnsafe`
- Zero `dangerouslySetInnerHTML`
- All `findFirst` in *.service.ts have justification comments

### Naming
- Models: @@map('snake_case')
- Enums: @@map + @map on values
- Monetary fields: Decimal @db.Decimal(12, 2)

## Testing Strategy

- **Unit tests:** 3+ files (auth, dashboard, data-source) with mocked Prisma
- **Integration tests:** auth + dashboard with supertest + real AppModule
- **Cross-layer:** full pipeline test (auth → CRUD → errors → correlation)
- **Security:** CSP headers, validation, auth requirements
- **Performance:** X-Response-Time header verification
- **Monitoring:** health, ready, metrics endpoints
- **Accessibility:** jest-axe with real component rendering
- **Keyboard:** userEvent tab/enter/space navigation
- **Log sanitizer:** array recursion, deep nesting, all sensitive keys

## Environment Variables

### Required
- DATABASE_URL — PostgreSQL connection with connection_limit
- JWT_SECRET — minimum 32 characters
- CORS_ORIGIN — allowed origin for CORS

### Optional
- PORT — API port (default: 3001)
- NODE_ENV — environment (development/production)
- JWT_EXPIRY — token expiration (default: 1h)
- LOG_LEVEL — Pino log level (default: info)

## Commands

```bash
pnpm install                # install dependencies
pnpm turbo run build        # build all packages
pnpm turbo run test         # run all tests
pnpm turbo run typecheck    # TypeScript type checking
pnpm turbo run lint         # run linters
```

## VERIFY/TRACED Tag Conventions

- Prefix: **AE-**
- VERIFY tags: only in specs/*.md files
- TRACED tags: only in .ts/.tsx files
- Minimum: 35 VERIFY tags with 100% bidirectional parity
- Every TRACED must reference an existing VERIFY tag ID
