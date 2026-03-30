# Fleet Dispatch — Project Instructions

## Overview

Fleet Dispatch is a multi-tenant field service dispatch platform built as part of the
CED (Convergence Engineering Development) experiment, Trial 2. It manages work orders,
tracks technicians, optimizes routes, and handles invoicing.

**APP_VERSION:** 1.0.0

## Architecture

### Monorepo Structure
```
fleet-dispatch/
  apps/api/          — NestJS 11 backend (port 3001)
  apps/web/          — Next.js 15 frontend (port 3000)
  packages/shared/   — Shared constants, utilities, validators
  specs/             — 7 specification documents + SPEC-INDEX.md
```

### Tech Stack
- Backend: NestJS 11, Prisma 6 (>=6.0.0 <7.0.0), PostgreSQL 16, JWT + bcrypt
- Frontend: Next.js 15, React 19, shadcn/ui, Tailwind CSS 4
- Monorepo: Turborepo 2, pnpm workspaces
- Testing: Jest 29, supertest 7, jest-axe, @testing-library

## Domain Entities

- **Company** — Multi-tenant root entity
- **User** — Authenticated user (roles: ADMIN, DISPATCHER, TECHNICIAN, CUSTOMER)
- **Technician** — Field worker with skills, GPS position, availability
- **Customer** — Service recipient with address
- **WorkOrder** — Central entity, 9-state machine (UNASSIGNED → PAID, CANCELLED from any except PAID)
- **WorkOrderStatusHistory** — Immutable audit trail
- **Route** — Daily optimized route for a technician
- **RouteStop** — Work order position in route
- **JobPhoto** — On-site photo with metadata
- **Invoice** — Generated from work order (DRAFT → SENT → PAID, VOID from DRAFT/SENT)
- **LineItem** — Invoice line item (labor, material, flat_rate, discount, tax)
- **Notification** — SMS/email/push notifications
- **AuditLog** — Immutable compliance records

## Key Design Decisions

### Authentication
- JWT with bcrypt (BCRYPT_SALT_ROUNDS=12 from shared)
- ADMIN excluded from self-registration (ALLOWED_REGISTRATION_ROLES)
- JWT_SECRET from env — no fallback

### Security
- Helmet CSP: default-src 'self', script-src 'self', style-src 'self' 'unsafe-inline'
- ThrottlerModule: default (100/min) + auth (5/min)
- CORS: CORS_ORIGIN env, credentials true, explicit methods/headers
- ValidationPipe: whitelist + forbidNonWhitelisted + transform

### Monitoring
- Pino structured JSON logging (no console.log)
- CorrelationIdMiddleware: preserves client X-Correlation-ID or generates UUID
- RequestLoggingMiddleware: method, URL, status, duration, correlationId
- GlobalExceptionFilter (APP_FILTER): sanitized errors, correlationId in response
- Health endpoints: /health, /health/ready ($queryRaw), /metrics

### Performance
- ResponseTimeInterceptor (APP_INTERCEPTOR): X-Response-Time header via perf_hooks
- Pagination: clampPagination (MAX_PAGE_SIZE=100, DEFAULT_PAGE_SIZE=20)
- Cache-Control headers on all list endpoints
- @@index on tenantId FKs, status fields, composites

### Frontend
- Dark mode via @media (prefers-color-scheme: dark) — not .dark class
- cn() with clsx + tailwind-merge
- loading.tsx: role="status" + aria-busy="true"
- error.tsx: role="alert" + useRef + useEffect focus + tabIndex={-1}
- next/dynamic for code splitting with Skeleton loading

## Code Conventions

### Binary Gates (zero tolerance)
- Zero `as any` type assertions
- Zero `console.log` in apps/api/src/
- Zero `|| 'value'` env var fallback patterns
- Zero `$executeRawUnsafe`
- Zero `dangerouslySetInnerHTML`
- All `findFirst` calls have justification comments
- TRACED tags only in .ts/.tsx files

### Architecture
- JwtAuthGuard as APP_GUARD (no per-controller @UseGuards)
- GlobalExceptionFilter as APP_FILTER (not main.ts)
- ResponseTimeInterceptor as APP_INTERCEPTOR (not main.ts)
- @Public() decorator for unauthenticated routes

## Testing Strategy

- **Unit tests:** work-order.service.spec.ts, invoice.service.spec.ts (mocked Prisma)
- **Integration tests:** auth, work-order, monitoring (supertest + real AppModule)
- **Cross-layer:** cross-layer.integration.spec.ts (full pipeline verification)
- **Security:** security.spec.ts (auth, validation, error sanitization)
- **Performance:** performance.spec.ts (response time, pagination)
- **Accessibility:** accessibility.spec.tsx (jest-axe on real components)
- **Keyboard:** keyboard.spec.tsx (userEvent tab/enter/space)
- **Log sanitizer:** log-sanitizer.spec.ts (arrays, deep nested, case-insensitive)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | PostgreSQL connection string with connection_limit |
| JWT_SECRET | Yes | JWT signing secret |
| CORS_ORIGIN | Yes | Allowed CORS origin |
| PORT | No | API port (default: 3001) |
| API_URL | No | Backend URL for frontend (default: http://localhost:3001) |

## Commands

```bash
pnpm install              # Install dependencies
pnpm turbo run build      # Build all packages
pnpm turbo run typecheck  # Type check
pnpm turbo run lint       # Lint
pnpm turbo run test       # Run tests
```

## VERIFY/TRACED Tags

- Prefix: FD-
- VERIFY tags in specs/ markdown files
- TRACED tags only in .ts/.tsx source files
- 41 total tags with 100% bidirectional parity
