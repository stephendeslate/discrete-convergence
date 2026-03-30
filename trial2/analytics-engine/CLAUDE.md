# Analytics Engine — Project Instructions

## Overview

Analytics Engine is a multi-tenant embeddable analytics platform built as part of
the CED (Convergence Engineering Development) experiment, Trial 2.
Version: 0.1.0 (matches APP_VERSION from shared package).

## Architecture

Turborepo monorepo with pnpm workspaces:
- `apps/api/` — NestJS 11 backend (port 3001)
- `apps/web/` — Next.js 15 admin portal (port 3000)
- `packages/shared/` — Shared constants, utilities, and types
- `specs/` — 7 specification documents + SPEC-INDEX.md

## Tech Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Backend | NestJS | ^11.0.0 |
| ORM | Prisma | >=6.0.0 <7.0.0 |
| Database | PostgreSQL | 16+ |
| Frontend | Next.js | ^15.0.0 |
| UI | React 19 + shadcn/ui + Tailwind CSS 4 |
| Auth | JWT + bcrypt (salt rounds 12) |
| Logger | Pino (structured JSON) |
| Monorepo | Turborepo ^2.0.0 + pnpm |

## Domain Entities

- **Tenant**: Organization with tier (FREE/PRO/ENTERPRISE) and theme
- **User**: Authenticated user with role (ADMIN/USER/VIEWER)
- **Dashboard**: Container for widgets (DRAFT → PUBLISHED → ARCHIVED)
- **Widget**: Chart/KPI bound to DataSource, positioned via CSS Grid
- **DataSource**: External data connection (REST_API/POSTGRESQL/CSV/WEBHOOK)
- **DataSourceConfig**: Encrypted connector credentials
- **FieldMapping**: Source-to-internal field mapping
- **SyncRun**: Data sync attempt (IDLE → RUNNING → COMPLETED/FAILED)
- **DataPoint**: Ingested data row with JSONB dimensions/metrics
- **AggregatedDataPoint**: Pre-aggregated time buckets
- **EmbedConfig**: Per-dashboard embed settings
- **QueryCache**: Cached query results with TTL and cost (Decimal)
- **DeadLetterEvent**: Failed ingestion rows for retry
- **ApiKey**: ADMIN or EMBED key with hash and prefix
- **AuditLog**: Immutable event log

## Key Design Decisions

### Authentication
- JWT access tokens (1h) and refresh tokens (7d)
- bcrypt with BCRYPT_SALT_ROUNDS=12 from shared package
- ALLOWED_REGISTRATION_ROLES excludes ADMIN

### Security
- Helmet CSP: default-src 'self', script-src 'self', style-src 'self' 'unsafe-inline'
- ThrottlerModule with 'default' (100/60s) and 'auth' (5/60s) configs
- CORS from CORS_ORIGIN env (no fallback, credentials true)
- ValidationPipe: whitelist + forbidNonWhitelisted + transform
- RLS on all tables (ENABLE + FORCE)

### Monitoring
- Pino structured JSON logger (DI-injectable)
- CorrelationIdMiddleware: preserves or generates X-Correlation-ID
- RequestContextService: request-scoped (correlationId, userId, tenantId)
- RequestLoggingMiddleware: method, URL, status, duration, correlationId
- GlobalExceptionFilter: sanitized errors, correlationId in response body

### Performance
- ResponseTimeInterceptor (APP_INTERCEPTOR) using performance.now()
- Pagination: clamp to [1, 100], default 20 — never reject
- Cache-Control headers on all list endpoints
- @@index on tenantId, status, and composite fields

### Frontend
- Dark mode via @media (prefers-color-scheme: dark) in globals.css
- cn() using clsx + tailwind-merge
- loading.tsx: role="status" + aria-busy="true"
- error.tsx: role="alert" + useRef + useEffect focus + tabIndex={-1}
- 9 shadcn/ui components (Button, Card, Input, Label, Separator, Switch, Tabs, Skeleton, Badge)

## Code Conventions

- Zero `as any` type assertions
- Zero `console.log` in `apps/api/src/`
- Zero `|| 'value'` env var fallbacks
- Zero `$executeRawUnsafe`
- Zero `dangerouslySetInnerHTML`
- All `findFirst` calls have justification comments (test mocks exempt)
- TRACED tags only in .ts/.tsx files
- All VERIFY/TRACED tags use AE- prefix

## Testing Strategy

- **Unit tests**: Dashboard service, DataSource service (mocked Prisma)
- **Integration tests**: Auth, Dashboard, Cross-layer, Monitoring, Security, Performance
- **Accessibility tests**: jest-axe with real components
- **Keyboard tests**: userEvent tab/enter/space
- **Log sanitizer tests**: arrays, deep nesting, case-insensitive keys

## Commands

```bash
pnpm install          # Install dependencies
pnpm turbo run build  # Build all packages
pnpm turbo run test   # Run all tests
pnpm turbo run lint   # Lint all packages
pnpm turbo run typecheck  # Type check all packages
```

## Environment Variables

Required: DATABASE_URL, JWT_SECRET, CORS_ORIGIN
Optional: NODE_ENV, LOG_LEVEL, PORT, API_URL

## VERIFY/TRACED Conventions

- Prefix: AE-
- VERIFY tags in specs/*.md files
- TRACED tags only in .ts/.tsx source files
- 100% bidirectional parity required
