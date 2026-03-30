# Fleet Dispatch (FD)

## Project Overview
- **Name:** Fleet Dispatch
- **Domain:** Fleet management and vehicle dispatch platform
- **Trial:** 7 (Discrete Convergence Experiment)
- **Layer:** L9 (All layers converged)
- **Methodology:** CED v0.7-dc
- **APP_VERSION:** 1.0.0

## Architecture

### Monorepo Structure
```
fleet-dispatch/
  apps/
    api/      # NestJS backend (REST API + Prisma ORM)
    web/      # Next.js frontend (App Router + shadcn/ui)
  packages/
    shared/   # Shared utilities, constants, validators
  specs/      # 7+ specification documents with VERIFY tags
```

### Tech Stack
- **Backend:** NestJS 11, Prisma 6, PostgreSQL 16
- **Frontend:** Next.js 15, React 19, Tailwind CSS 4, shadcn/ui
- **Auth:** JWT + bcrypt (salt rounds: 12)
- **Logger:** Pino (structured JSON)
- **Monorepo:** Turborepo 2 + pnpm workspaces
- **Runtime:** Node.js 20 (Alpine)

## Domain Entities
- **User** — Authentication, roles (ADMIN, DISPATCHER, DRIVER, VIEWER)
- **Tenant** — Multi-tenant isolation
- **Vehicle** — Fleet vehicles with status tracking
- **Driver** — Driver profiles with license info
- **Route** — Dispatch routes with origin/destination
- **Dispatch** — Vehicle-driver-route assignments
- **MaintenanceRecord** — Vehicle maintenance tracking
- **AuditLog** — Action audit trail

### Entity Statuses
- Vehicle: AVAILABLE, IN_USE, MAINTENANCE, RETIRED
- Driver: ACTIVE, INACTIVE, ON_LEAVE, TERMINATED
- Route: PLANNED, ACTIVE, COMPLETED, CANCELLED
- Dispatch: PENDING, ASSIGNED, IN_TRANSIT, DELIVERED, FAILED
- Maintenance: PREVENTIVE, CORRECTIVE, EMERGENCY

## Key Design Decisions
- **Auth:** Global JwtAuthGuard via APP_GUARD; @Public() exempts health/auth routes
- **RBAC:** RolesGuard via APP_GUARD with @Roles() decorator
- **Security:** Helmet CSP, ThrottlerModule (default + auth), CORS from env
- **Monitoring:** Pino logger, CorrelationIdMiddleware, RequestContextService (request-scoped)
- **Performance:** ResponseTimeInterceptor (APP_INTERCEPTOR), pagination clamping, Cache-Control headers
- **Error handling:** GlobalExceptionFilter (APP_FILTER) sanitizes errors, no stack traces
- **Data:** Decimal for money, @@index on FKs/status/composites, RLS enabled
- **Frontend:** Dark mode via prefers-color-scheme, loading.tsx/error.tsx on all routes

## Code Conventions (Binary Gates)
- Zero `as any` type assertions
- Zero `console.log` in apps/api/src/
- Zero `|| 'value'` env var fallbacks (use ?? or validation)
- Zero `$executeRawUnsafe`
- Zero `dangerouslySetInnerHTML`
- All findFirst calls in *.service.ts have justification comments
- TRACED tags only in .ts/.tsx files
- All DTO string fields: @IsString() + @MaxLength()
- All UUID DTO fields: @MaxLength(36)
- All models: @@map('snake_case')
- All enums: @@map + @map on values
- Monetary fields: Decimal @db.Decimal(12, 2)

## Testing Strategy
- **Unit tests:** Auth service, Vehicle service, Dispatch service (Prisma mocked)
- **Integration tests:** Auth, Vehicle, Cross-layer (supertest + real AppModule)
- **Security tests:** Auth enforcement, RBAC, input validation, error sanitization
- **Performance tests:** X-Response-Time, pagination, Cache-Control
- **Monitoring tests:** Health, readiness, metrics (supertest)
- **Accessibility tests:** jest-axe on UI components
- **Keyboard tests:** userEvent tab/enter/space
- **Log sanitizer tests:** Including array/nested cases

## Environment Variables
### Required
- `DATABASE_URL` — PostgreSQL connection string (include connection_limit)
- `JWT_SECRET` — JWT signing secret
- `CORS_ORIGIN` — Allowed CORS origin

### Optional
- `PORT` — API port (default: 3000)
- `LOG_LEVEL` — Pino log level (default: info)

## Commands
```bash
pnpm install           # Install all dependencies
pnpm turbo run build   # Build all packages
pnpm turbo run test    # Run all tests
pnpm turbo run lint    # Lint all packages
pnpm turbo run typecheck  # Type-check all packages
```

## VERIFY/TRACED Tag Conventions
- **Tag prefix:** FD
- **Format:** FD-{DOMAIN}-{NNN} (e.g., FD-AUTH-001, FD-VEH-003)
- **VERIFY tags:** Only in specs/*.md files
- **TRACED tags:** Only in .ts/.tsx source files
- **Parity:** Every VERIFY must have a matching TRACED and vice versa
