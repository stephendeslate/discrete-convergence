# Event Management Platform

Multi-tenant event management system built with NestJS 11, Prisma 6, Next.js 15, React 19, and Tailwind CSS 4.

## Architecture

- **Monorepo**: Turborepo + pnpm workspaces (`apps/api`, `apps/web`, `packages/shared`)
- **API**: NestJS 11 with Prisma 6 ORM, PostgreSQL 16
- **Web**: Next.js 15 App Router with React 19
- **Shared**: TypeScript library with 8+ consumed exports (zero dead exports)

## Key Patterns

### Multi-tenancy
- All data queries are scoped by `tenantId` extracted from JWT via `@Req()`
- Row Level Security (RLS) enabled with `ENABLE` + `FORCE` on all 6 tables
- RLS set via `$executeRaw` with `Prisma.sql` template (never `$executeRawUnsafe`)
- TEXT comparison in RLS policies (no `::uuid` cast)

### Authentication
- JWT-based with 1h token expiry
- Global `APP_GUARD` chain: `ThrottlerGuard` -> `JwtAuthGuard` -> `RolesGuard`
- `@Public()` decorator bypasses auth for specific endpoints
- `bcryptjs` (not `bcrypt`) with `BCRYPT_SALT_ROUNDS` from shared package
- No hardcoded JWT secret fallbacks

### Security
- Helmet with CSP headers
- CORS from environment variable (no hardcoded origins)
- `ValidationPipe` with `whitelist: true, forbidNonWhitelisted: true, transform: true`
- Rate limiting: `ThrottlerModule` with named configs (default + auth)
- `GlobalExceptionFilter` sanitizes errors using `sanitizeLogContext`

### Monitoring
- Pino structured logging with correlation IDs
- `formatLogEntry()` and `sanitizeLogContext()` from shared package
- `GlobalExceptionFilter` (APP_FILTER) with correlation in error responses
- `ResponseTimeInterceptor` (APP_INTERCEPTOR) adds `X-Response-Time` header
- Health endpoints: `/health` (basic), `/health/ready` (DB), `/metrics`
- MonitoringController fully `@Public()` + `@SkipThrottle()`

### Data Model
- 6 models: Tenant, User, Event, Venue, Attendee, Registration
- All Prisma models use `@@map("snake_case")` for table names
- Enums use `@@map` and `@map` for PostgreSQL naming
- Composite indexes on `tenantId` + relevant fields
- `Decimal` type for event price

## Convention Gates

- Zero `as any` casts
- Zero `console.log` in `apps/api/src/`
- Zero `|| 'value'` fallbacks (use `??` or env validation)
- Zero `$executeRawUnsafe` calls
- `findFirst` calls in `*.service.ts` must have justification comment on preceding line
- TRACED tags only in `.ts`/`.tsx` files (never `.prisma`, `.json`, `.yaml`, `.css`)

## Shared Package Exports

1. `APP_VERSION` — application version string
2. `BCRYPT_SALT_ROUNDS` — bcrypt cost factor (12)
3. `ALLOWED_REGISTRATION_ROLES` — role whitelist for registration (VIEWER)
4. `MAX_PAGE_SIZE` — pagination ceiling (100)
5. `DEFAULT_PAGE_SIZE` — pagination default (20)
6. `SENSITIVE_KEYS` — keys redacted in log output
7. `clampPagination` — pagination clamping utility
8. `createCorrelationId` — UUID-based correlation ID generator
9. `formatLogEntry` — structured log formatter
10. `sanitizeLogContext` — redacts sensitive fields from log context
11. `validateEnvVars` — environment variable validation with process.exit(1)

## Spec Traceability

- 8 spec files in `specs/` with VERIFY tags (47 total)
- Matching TRACED tags in `.ts`/`.tsx` source files only
- Index: `specs/SPEC-INDEX.md`

## Commands

```bash
pnpm install                    # Install dependencies
pnpm turbo run build           # Build all packages
pnpm turbo run test            # Run all tests
pnpm turbo run lint            # Lint all packages
pnpm turbo run typecheck       # Type-check all packages
```

## Infrastructure

- **Dockerfile**: Multi-stage (deps -> build -> production), `node:20-alpine`, `USER node`
- **Docker Compose**: PostgreSQL 16 with `pg_isready` healthcheck, named volume
- **CI**: GitHub Actions with PostgreSQL service container, lint/test/build/typecheck/audit
- **Environment**: All vars validated at startup, documented in `.env.example`

## Frontend

- Dark mode: `@media (prefers-color-scheme: dark)` in `globals.css` (NOT `.dark` class)
- 9 shadcn/ui-style components in `components/ui/`
- `cn()` utility with `clsx` + `tailwind-merge`
- Server actions in `lib/actions.ts` with `'use server'`
- Route constants use single-quoted strings for FI detection
- Loading states: `role="status"` + `aria-busy="true"` + Skeleton
- Error boundaries: `role="alert"` + `useRef` + focus management with `tabIndex={-1}`
- Accessibility tests with `jest-axe`
- Keyboard navigation tests with `@testing-library/user-event`
