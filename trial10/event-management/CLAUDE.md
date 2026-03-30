# Event Management

Multi-tenant event management platform built with NestJS 11, Prisma 6, Next.js 15, React 19, and Tailwind CSS 4.

## Architecture

- **Monorepo**: Turborepo + pnpm workspaces (`apps/api`, `apps/web`, `packages/shared`)
- **API**: NestJS 11 with Prisma 6 ORM, PostgreSQL 16
- **Web**: Next.js 15 App Router with React 19
- **Shared**: TypeScript library with 8 consumed exports (zero dead exports)

## Key Patterns

### Multi-tenancy
- All data queries are scoped by `tenantId`
- Row Level Security (RLS) enabled with `ENABLE` + `FORCE` on all tables
- RLS policies use TEXT comparison (no `::uuid` cast)
- RLS set via `$executeRaw` with `Prisma.sql` template (never `$executeRawUnsafe`)

### Authentication
- JWT-based with access + refresh tokens
- Global `APP_GUARD` chain: `ThrottlerGuard` -> `JwtAuthGuard` -> `RolesGuard`
- `@Public()` decorator bypasses auth for specific endpoints
- `bcryptjs` (not bcrypt) with `BCRYPT_SALT_ROUNDS` from shared package

### Authorization
- `@Roles()` decorator for role-based access control
- ORGANIZER and ATTENDEE are self-registrable via `ALLOWED_REGISTRATION_ROLES`
- ADMIN role is seed-only, not self-registrable
- RolesGuard checks JWT role against route metadata

### Security
- Helmet with CSP headers
- CORS from environment variable (no hardcoded origins)
- `ValidationPipe` with `whitelist: true, forbidNonWhitelisted: true`
- Rate limiting: `ThrottlerModule` with named configs (default + auth)

### Monitoring
- Pino structured logging with correlation IDs
- `formatLogEntry()` and `sanitizeLogContext()` from shared package
- `GlobalExceptionFilter` (APP_FILTER) with correlation in error responses
- `ResponseTimeInterceptor` (APP_INTERCEPTOR) adds `X-Response-Time` header
- Health endpoints: `/health` (basic), `/health/ready` (DB), `/metrics` (APP_VERSION)

### Data Model
- 5 domain entities: User, Event, Venue, Ticket, Registration
- All Prisma models use `@@map("snake_case")` for table names
- Enums use `@@map` and `@map` for PostgreSQL naming
- Composite indexes on frequently queried fields (`tenantId` + status)
- `Decimal(12,2)` for ticket pricing (never Float)
- Event status workflow: DRAFT -> PUBLISHED -> CANCELLED

## Convention Gates

- Zero `as any` casts
- Zero `console.log` in `apps/api/src/`
- Zero `|| 'value'` fallbacks (use `??` or env validation)
- Zero `$executeRawUnsafe` calls
- `findFirst` calls in `*.service.ts` must have justification comment on preceding line

## Shared Package Exports (exactly 8)

1. `BCRYPT_SALT_ROUNDS` -- bcrypt cost factor (12)
2. `ALLOWED_REGISTRATION_ROLES` -- role whitelist for registration ['ORGANIZER', 'ATTENDEE']
3. `APP_VERSION` -- application version string
4. `clampPagination` -- pagination helper (MAX_PAGE_SIZE=100, DEFAULT_PAGE_SIZE=20)
5. `createCorrelationId` -- UUID-based correlation ID generator
6. `formatLogEntry` -- structured log formatter
7. `sanitizeLogContext` -- redacts sensitive fields from log context
8. `validateEnvVars` -- environment variable validation with process.exit(1)

## Spec Traceability

- 9 spec files in `specs/` with VERIFY tags (49 total)
- Matching TRACED tags in `.ts`/`.tsx` source files only
- TRACED tags never appear in `.prisma`, `.sql`, `.css`, `.yaml`, `.json` files
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
- 8 shadcn/ui-style components in `components/ui/`
- `cn()` utility with `clsx` + `tailwind-merge`
- Server actions in `lib/actions.ts` with `'use server'`
- Cookie-based token storage with httpOnly, secure, sameSite attributes
- Loading states: `role="status"` + `aria-busy="true"`
- Error boundaries: `role="alert"` + `useRef` + focus management
- Route constants as single-quoted string literals
