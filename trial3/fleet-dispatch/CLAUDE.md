# Fleet Dispatch — CLAUDE.md

## Project Overview

- **Name:** Fleet Dispatch
- **Domain:** Multi-tenant field service dispatch platform
- **Trial:** 3 (Discrete Convergence)
- **Layer:** L9 (Cross-Layer Integration)
- **APP_VERSION:** 1.0.0

## Architecture

### Monorepo Structure

```
fleet-dispatch/
  apps/
    api/          # NestJS 11 backend (port 3001)
    web/          # Next.js 15 frontend (port 3000)
  packages/
    shared/       # Shared types, constants, utilities
  specs/          # Specification documents
```

### Tech Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Backend | NestJS | ^11.0.0 |
| ORM | Prisma | >=6.0.0 <7.0.0 |
| Database | PostgreSQL | 16+ |
| Frontend | Next.js | ^15.0.0 |
| UI | React | ^19.0.0 |
| CSS | Tailwind CSS | ^4.0.0 |
| Components | shadcn/ui patterns | 9 components |
| Monorepo | Turborepo | ^2.0.0 |
| Package Manager | pnpm | workspaces |
| Auth | JWT + bcrypt | salt rounds 12 |
| Logger | Pino | structured JSON |

## Domain Entities

- **Company** — Tenant with name, slug
- **User** — ADMIN, DISPATCHER, TECHNICIAN, CUSTOMER roles
- **Technician** — 1:1 with User, skills[], GPS position
- **Customer** — 1:1 with User, address, contact info
- **WorkOrder** — 9-state machine (UNASSIGNED→PAID, CANCELLED)
- **WorkOrderStatusHistory** — Immutable audit trail
- **Route** — Daily optimized route for technician
- **RouteStop** — Position in route with ETA
- **JobPhoto** — On-site photo metadata
- **Invoice** — DRAFT→SENT→PAID, VOID from DRAFT/SENT
- **LineItem** — Labor, material, flat_rate, discount, tax
- **Notification** — Lifecycle event messages
- **AuditLog** — Compliance records

## Key Design Decisions

### Authentication
- JWT tokens with 24h expiry
- bcrypt with BCRYPT_SALT_ROUNDS from shared (12)
- JwtAuthGuard as APP_GUARD (global, not per-controller)
- @Public() decorator exempts auth/health routes
- ADMIN role excluded from registration

### Security
- Helmet.js with CSP (default-src 'self', frame-ancestors 'none')
- ThrottlerGuard with default (100/min) and auth (5/min) configs
- CORS from CORS_ORIGIN env (no fallback)
- ValidationPipe: whitelist + forbidNonWhitelisted + transform
- Row Level Security on all tables

### Monitoring
- Pino structured JSON logger (DI-injectable)
- CorrelationIdMiddleware preserves/generates X-Correlation-ID
- RequestContextService (request-scoped)
- RequestLoggingMiddleware with formatLogEntry from shared
- GlobalExceptionFilter with sanitizeLogContext
- Health endpoints exempt from auth and rate limiting

### Performance
- ResponseTimeInterceptor as APP_INTERCEPTOR
- Pagination with clamp (MAX_PAGE_SIZE=100)
- Cache-Control headers on list endpoints
- Database indexes on tenantId, status, composites

### Frontend
- Dark mode via @media (prefers-color-scheme: dark)
- cn() utility with clsx + tailwind-merge
- loading.tsx with role="status" + aria-busy="true"
- error.tsx with role="alert" + useRef + focus management
- Server Actions checking response.ok before redirect
- next/dynamic for code splitting

## Code Conventions

### Binary Gates
- Zero `as any` type assertions
- Zero `console.log` in apps/api/src/
- Zero `|| 'value'` env var fallback patterns
- Zero `$executeRawUnsafe`
- Zero `dangerouslySetInnerHTML`
- All `findFirst` in *.service.ts have justification comments
- TRACED tags only in .ts/.tsx files

### Naming
- Prisma models: @@map('snake_case')
- Prisma enums: @@map + @map on values
- Database columns: @map('snake_case')

## Testing Strategy

### Unit Tests (3+ files)
- auth.service.spec.ts
- work-order.service.spec.ts
- invoice.service.spec.ts

### Integration Tests (2+ files)
- auth.integration.spec.ts
- work-order.integration.spec.ts

### Specialized Tests
- cross-layer.integration.spec.ts
- monitoring.spec.ts (supertest)
- security.spec.ts (supertest)
- performance.spec.ts (supertest)
- accessibility.spec.tsx (jest-axe)
- keyboard.spec.tsx (userEvent)
- log-sanitizer.spec.ts (array cases)

## Environment Variables

| Variable | Required | Default |
|----------|----------|---------|
| DATABASE_URL | Yes | — |
| JWT_SECRET | Yes | — |
| CORS_ORIGIN | Yes | — |
| PORT | No | 3001 |
| API_URL | No | — |

## Commands

```bash
pnpm install              # Install dependencies
pnpm turbo run build      # Build all packages
pnpm turbo run test       # Run all tests
pnpm turbo run lint       # Lint all packages
pnpm turbo run typecheck  # Type check all packages
```

## VERIFY/TRACED Conventions

- **Prefix:** FD-
- **TRACED location:** Only in .ts/.tsx files
- **VERIFY location:** Only in specs/*.md files
- **Parity:** Every VERIFY has a TRACED, every TRACED has a VERIFY
- **Total VERIFY tags:** 47
