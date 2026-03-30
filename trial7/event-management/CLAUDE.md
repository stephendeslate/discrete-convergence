# Event Management Platform

## Project Overview
- **Name:** Event Management (EM)
- **Domain:** Event planning and ticketing platform
- **Trial:** 7 (discrete-convergence experiment)
- **Methodology:** CED v0.7-dc (Convergence Engineering Development)
- **Version:** 1.0.0 (APP_VERSION from @event-management/shared)
- **Layers:** L0-L9 converged

## Architecture

### Monorepo Structure
```
event-management/
  apps/api/       — NestJS 11 backend API
  apps/web/       — Next.js 15 frontend
  packages/shared/ — Shared constants, utilities, types
```

### Tech Stack
- **Backend:** NestJS 11, Prisma 6, PostgreSQL 16
- **Frontend:** Next.js 15, React 19, Tailwind CSS 4, shadcn/ui
- **Auth:** JWT + bcrypt (12 salt rounds)
- **Logger:** Pino (structured JSON)
- **Monorepo:** Turborepo 2, pnpm workspaces
- **Runtime:** Node.js 20

## Domain Entities

### Models
- **User** — tenant-scoped, roles: USER, ORGANIZER, ADMIN
- **Tenant** — multi-tenant organization
- **Event** — statuses: DRAFT, PUBLISHED, CANCELLED, COMPLETED
- **Ticket** — statuses: RESERVED, CONFIRMED, CANCELLED, USED
- **Venue** — physical locations for events
- **Category** — event classification
- **AuditLog** — actions: CREATE, UPDATE, DELETE, LOGIN

### Key Relationships
- User belongs to Tenant, creates Events and Tickets
- Event belongs to Venue, Category, and Organizer (User)
- Ticket belongs to Event and User
- AuditLog tracks User actions within a Tenant

## Key Design Decisions

### Authentication & Authorization
- JWT tokens with 24h expiry
- Global JwtAuthGuard via APP_GUARD — all routes protected by default
- @Public() decorator exempts specific routes (health, auth)
- RolesGuard checks @Roles() metadata for RBAC
- ADMIN role excluded from self-registration (ALLOWED_REGISTRATION_ROLES)
- ThrottlerGuard rate limits: default (100/min), auth (5/min)

### Security
- Helmet.js with strict CSP (default-src 'self', frame-ancestors 'none')
- CORS from CORS_ORIGIN env (no fallback, credentials true)
- ValidationPipe: whitelist + forbidNonWhitelisted + transform
- GlobalExceptionFilter: no stack traces in responses, correlationId in body
- All DTOs use class-validator decorators (@IsString, @MaxLength, etc.)

### Monitoring
- Pino structured JSON logging (DI-injectable, never console.log)
- CorrelationIdMiddleware: preserves/generates X-Correlation-ID
- RequestContextService (request-scoped): correlationId, userId, tenantId
- RequestLoggingMiddleware: logs method, URL, status, duration
- Health endpoints: /health, /health/ready ($queryRaw DB check)
- Metrics endpoint: /metrics (request/error counts, avg response time)

### Performance
- ResponseTimeInterceptor (APP_INTERCEPTOR): X-Response-Time on all responses
- Pagination: MAX_PAGE_SIZE=100, DEFAULT_PAGE_SIZE=20, clamp (not reject)
- Cache-Control headers on all list endpoints
- @@index on tenantId FKs, status fields, composite indexes
- Prisma include for N+1 prevention

### Data Architecture
- Monetary fields: Decimal @db.Decimal(12, 2) — never Float
- All models: @@map('snake_case')
- All enums: @@map + @map on values
- Row Level Security: ENABLE + FORCE on all tables
- $executeRaw with Prisma.sql template (no $executeRawUnsafe)

### Frontend Patterns
- Dark mode via @media (prefers-color-scheme: dark)
- cn() utility using clsx + tailwind-merge
- loading.tsx: role="status" + aria-busy="true"
- error.tsx: role="alert" + useRef + focus management
- Server Actions with 'use server', check response.ok before redirect
- next/dynamic for code splitting with Skeleton loading

## Code Conventions (Binary Gates)
- Zero `as any` type assertions
- Zero `console.log` in apps/api/src/
- Zero `|| 'value'` env var fallbacks
- Zero `$executeRawUnsafe`
- Zero `dangerouslySetInnerHTML`
- All findFirst in *.service.ts have justification comments
- TRACED tags only in .ts/.tsx files

## Testing Strategy
- **Unit tests:** Auth service, event service, venue service, category service (Prisma mocked)
- **Integration tests:** Auth, event, cross-layer (supertest with real AppModule)
- **Security tests:** Auth enforcement, input validation, error sanitization
- **Performance tests:** X-Response-Time, Cache-Control, pagination
- **Monitoring tests:** Health, readiness, metrics (supertest)
- **Accessibility tests:** jest-axe on components
- **Keyboard tests:** userEvent tab/enter/space
- **Sanitizer tests:** Including array/nested cases

## Environment Variables
- `DATABASE_URL` (required) — PostgreSQL connection with connection_limit
- `JWT_SECRET` (required) — JWT signing secret
- `CORS_ORIGIN` (required) — Allowed CORS origin
- `PORT` (optional, default 3000) — API port
- `LOG_LEVEL` (optional, default info) — Pino log level
- `API_URL` (optional) — Backend URL for frontend

## Commands
```bash
pnpm install          # Install dependencies
pnpm turbo run build  # Build all packages
pnpm turbo run test   # Run all tests
pnpm turbo run lint   # Lint all packages
pnpm turbo run typecheck  # TypeScript strict check
```

## VERIFY/TRACED Tag Conventions
- **Prefix:** EM (Event Management)
- **Format:** EM-{DOMAIN}-{NNN} (e.g., EM-AUTH-001, EM-EVT-003)
- **VERIFY tags:** In specs/ markdown files only
- **TRACED tags:** In .ts/.tsx source files only
- **Parity:** 100% bidirectional — every VERIFY has a TRACED, every TRACED has a VERIFY
