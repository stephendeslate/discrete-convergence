# Event Management Platform

## Project Overview

Multi-tenant event management platform for organizations to create, schedule, and manage
events with attendee registration, ticketing, and check-in. Trial 3 of the discrete-convergence
experiment using Convergence Engineering Development (CED) methodology.

**Version:** 1.0.0 (matches APP_VERSION in packages/shared)
**Trial:** 3
**Layer:** L9 (Cross-Layer Integration — all layers)

## Architecture

### Monorepo Structure
```
event-management/
  apps/api/         # NestJS 11 backend (port 3001)
  apps/web/         # Next.js 15 frontend (port 3000)
  packages/shared/  # Shared utilities, constants, types
  specs/            # 8 specification documents with 39 VERIFY tags
```

### Tech Stack
- **Backend:** NestJS 11 + Prisma 6 + PostgreSQL 16
- **Frontend:** Next.js 15 + React 19 + Tailwind CSS 4 + shadcn/ui
- **Monorepo:** Turborepo 2 + pnpm workspaces
- **Auth:** JWT + bcrypt (12 salt rounds)
- **Logger:** Pino (structured JSON)
- **Testing:** Jest + Supertest + jest-axe

## Domain Entities

- **Organization** — Tenant with name, slug, tier
- **User** — ADMIN, ORGANIZER, ATTENDEE roles
- **Event** — Lifecycle: DRAFT → PUBLISHED → REGISTRATION_OPEN → REGISTRATION_CLOSED → IN_PROGRESS → COMPLETED → ARCHIVED (CANCELLED from any non-COMPLETED)
- **EventSession** — Time slots within events
- **Venue** — Physical or virtual locations
- **TicketType** — Ticket tiers with Decimal pricing
- **Registration** — PENDING → CONFIRMED → CHECKED_IN (or CANCELLED)
- **CheckIn** — Idempotent QR-scanned records
- **WaitlistEntry** — FIFO queue for sold-out tickets
- **Notification** — QUEUED → SENT/FAILED
- **AuditLog** — Immutable action log

## Key Design Decisions

### Authentication & Security
- JwtAuthGuard as APP_GUARD (no per-controller @UseGuards)
- @Public() decorator exempts health, auth routes
- ThrottlerGuard as APP_GUARD with default (100/min) and auth (5/min) configs
- Helmet CSP: default-src 'self', frame-ancestors 'none'
- CORS from CORS_ORIGIN env (no fallback)
- ValidationPipe: whitelist + forbidNonWhitelisted + transform

### Monitoring
- Pino structured JSON logger (DI-injectable)
- CorrelationIdMiddleware: preserves or generates X-Correlation-ID
- RequestContextService: request-scoped correlation/user/tenant tracking
- GlobalExceptionFilter as APP_FILTER with sanitized error logging
- ResponseTimeInterceptor as APP_INTERCEPTOR with performance.now()

### Performance
- Pagination: clampPagination (not reject) with MAX_PAGE_SIZE=100
- Cache-Control headers on all list endpoints
- @@index on tenantId FKs, status fields, composites
- Prisma include for N+1 prevention
- next/dynamic for dashboard component code splitting

### Frontend Patterns
- Dark mode via @media (prefers-color-scheme: dark)
- cn() utility with clsx + tailwind-merge
- loading.tsx: role="status" + aria-busy="true"
- error.tsx: role="alert" + useRef + focus management with tabIndex={-1}
- Server Actions: 'use server' with response.ok check before redirect
- 9 shadcn/ui components: Button, Card, Input, Label, Badge, Skeleton, Table, Alert, Select

## Code Conventions

- Zero `as any` type assertions
- Zero `console.log` in apps/api/src/
- Zero `|| 'value'` env var fallback patterns
- Zero `$executeRawUnsafe` or `dangerouslySetInnerHTML`
- All `findFirst` calls have justification comment on preceding line
- All models: @@map('snake_case')
- All enums: @@map + @map on values
- Monetary fields: Decimal @db.Decimal(12, 2)
- ORM packages: >=6.0.0 <7.0.0 ranges (no caret)

## Testing Strategy

- **Unit tests (3+):** auth.service, event.service, venue.service (mock Prisma)
- **Integration tests (2+):** auth, event (supertest + real AppModule)
- **Cross-layer:** full pipeline test (auth → CRUD → errors → correlation → timing)
- **Security:** helmet, auth enforcement, validation
- **Performance:** X-Response-Time verification, timing
- **Monitoring:** health, readiness, metrics (supertest)
- **Accessibility:** jest-axe on real components
- **Keyboard:** userEvent tab/enter/space tests
- **Sanitizer:** log-sanitizer with array test cases

## Environment Variables

**Required:**
- DATABASE_URL — PostgreSQL connection with connection_limit
- JWT_SECRET — Token signing secret
- CORS_ORIGIN — Allowed CORS origin

**Optional:**
- PORT — API port (default 3001)
- NODE_ENV — Environment (development/production)
- LOG_LEVEL — Pino log level (default info)
- API_URL — Backend URL for frontend actions

## Commands

```bash
pnpm install                    # Install all dependencies
pnpm turbo run build            # Build all packages
pnpm turbo run typecheck        # TypeScript type checking
pnpm turbo run lint             # ESLint
pnpm turbo run test             # Run all tests
```

## VERIFY/TRACED Conventions

- **Prefix:** EM-
- **TRACED** tags only in .ts/.tsx files
- **VERIFY** tags only in specs/ markdown files
- 39 VERIFY tags across 8 spec documents
- 100% bidirectional parity required
