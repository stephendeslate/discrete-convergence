# Event Management — Project Instructions

## Overview

**Project:** Event Management
**Domain:** Multi-tenant event management platform
**Trial:** 2
**Methodology:** CED (Convergence Engineering Development)
**Version:** 1.0.0 (APP_VERSION from shared)

A multi-tenant platform for organizations to create, schedule, and manage events
with attendee registration, ticketing, venue management, and check-in.

## Architecture

### Monorepo Structure

```
event-management/
  apps/api/         — NestJS 11 backend (port 3001)
  apps/web/         — Next.js 15 frontend (port 3000)
  packages/shared/  — Shared constants, utilities, types
  specs/            — 7 specification documents + SPEC-INDEX
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS 11, Prisma 6 (pinned >=6.0.0 <7.0.0), PostgreSQL 16 |
| Frontend | Next.js 15, React 19, Tailwind CSS 4, shadcn/ui |
| Auth | JWT + bcrypt (salt rounds 12 from shared) |
| Monorepo | Turborepo 2, pnpm workspaces |
| Testing | Jest 29, supertest, jest-axe, @testing-library/user-event |

## Domain Entities

- **Organization** — Tenant root with name, slug
- **User** — email + passwordHash + role (ADMIN, ORGANIZER, ATTENDEE)
- **Event** — Lifecycle: DRAFT -> PUBLISHED -> REGISTRATION_OPEN -> ... -> COMPLETED -> ARCHIVED
- **EventSession** — Time slots within events (multi-track conferences)
- **Venue** — Physical/virtual locations with capacity
- **TicketType** — Ticket tiers with price (in cents) and quota
- **Registration** — Lifecycle: PENDING -> CONFIRMED -> CHECKED_IN (or CANCELLED)
- **CheckIn** — QR-scanned check-in record
- **WaitlistEntry** — FIFO queue for sold-out events
- **Notification** / **NotificationTemplate** — Email notifications
- **AuditLog** — Immutable action log

## Key Design Decisions

### Authentication
- JWT with bcrypt, BCRYPT_SALT_ROUNDS=12 from shared
- JwtAuthGuard as APP_GUARD — all endpoints protected by default
- @Public() decorator for health and auth routes
- ADMIN role excluded from registration

### Security
- Helmet CSP: default-src 'self', script-src 'self', frame-ancestors 'none'
- ThrottlerModule: default (100/60s) + auth (5/60s)
- ValidationPipe: whitelist + forbidNonWhitelisted + transform
- CORS from CORS_ORIGIN env (no fallback)
- validateEnvVars() at startup

### Monitoring
- CorrelationIdMiddleware: preserves/generates X-Correlation-ID
- RequestLoggingMiddleware: structured logs via formatLogEntry from shared
- GlobalExceptionFilter as APP_FILTER: sanitized errors, no stack traces
- Health endpoints: /health, /health/ready ($queryRaw), /metrics

### Performance
- ResponseTimeInterceptor as APP_INTERCEPTOR: X-Response-Time header
- Pagination: clampPagination from shared (max 100, default 20)
- Cache-Control headers on list endpoints
- @@index on tenantId, status, composites

### Frontend
- Dark mode via @media (prefers-color-scheme: dark) in globals.css
- cn() utility with clsx + tailwind-merge
- loading.tsx: role="status" + aria-busy="true"
- error.tsx: role="alert" + useRef + useEffect focus + tabIndex={-1}
- Server Actions checking response.ok
- 9 shadcn/ui components in components/ui/

## Code Conventions

### Binary Gates
- Zero `as any` type assertions
- Zero `console.log` in apps/api/src/
- Zero `|| 'value'` env var fallback patterns
- Zero `$executeRawUnsafe`
- Zero `dangerouslySetInnerHTML`
- All findFirst calls have justification comments
- TRACED tags ONLY in .ts/.tsx files

### Naming
- All Prisma models: @@map('snake_case_table_name')
- All Prisma enums: @@map + @map on values
- Ticket prices stored as integers (cents)

## Testing Strategy

- **Integration tests:** auth, event, cross-layer, monitoring, security, performance (supertest)
- **Unit tests:** event.service.spec.ts, registration.service.spec.ts (mocked Prisma)
- **Log sanitizer:** array cases, deep nesting, case-insensitive
- **Accessibility:** jest-axe with real components
- **Keyboard:** userEvent tab/enter/space

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | PostgreSQL connection with connection_limit |
| JWT_SECRET | Yes | JWT signing secret |
| CORS_ORIGIN | Yes | Allowed CORS origin |
| PORT | No | API port (default 3001) |
| API_URL | No | API URL for frontend |

## Commands

```bash
pnpm install            # Install dependencies
pnpm turbo run build    # Build all packages
pnpm turbo run typecheck # Type checking
pnpm turbo run lint     # Linting
pnpm turbo run test     # Run tests
```

## VERIFY/TRACED Tag Conventions

- Prefix: `EM-`
- VERIFY tags: in specs/ markdown files only
- TRACED tags: in .ts/.tsx source files only
- 46 tags with 100% bidirectional parity
- Categories: AUTH, DATA, API, UI, INFRA, SEC, MON, ARCH, PERF, EVT, REG, TEST, AX
