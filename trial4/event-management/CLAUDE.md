# Event Management

Multi-tenant event management platform for organizations to create, schedule, and manage events
with attendee registration, ticketing, and check-in. Built with NestJS 11, Prisma 6,
Next.js 15, React 19, and Tailwind CSS 4.

Trial 4 of the discrete-convergence experiment. All 10 layers (L0-L9) implemented.
APP_VERSION: 1.0.0

## Architecture

- **Monorepo**: Turborepo + pnpm workspaces (`apps/api`, `apps/web`, `packages/shared`)
- **API**: NestJS 11 with Prisma 6 ORM, PostgreSQL 16
- **Web**: Next.js 15 App Router with React 19
- **Shared**: TypeScript library with 8 consumed exports (zero dead exports)

## Domain Entities

- **Organization**: Multi-tenant root entity with tier (Free/Pro/Enterprise)
- **User**: Authenticated user with role (ADMIN, ORGANIZER, ATTENDEE)
- **Event**: Central entity with lifecycle status (DRAFT → PUBLISHED → COMPLETED)
- **EventSession**: Time slots within an event for multi-track conferences
- **Venue**: Physical or virtual location with capacity
- **TicketType**: Ticket tiers with price (Decimal) and quota
- **Registration**: Attendee registration with status workflow
- **CheckIn**: QR-scanned check-in record (idempotent)
- **WaitlistEntry**: FIFO queue for sold-out ticket types
- **Notification**: Queued email notifications with templates
- **AuditLog**: Immutable event log for organization actions

## Key Patterns

### Multi-tenancy
- All data queries scoped by `organizationId`
- Row Level Security (RLS) enabled with ENABLE + FORCE on all tables
- RLS context set via `$executeRaw` with `Prisma.sql` template (never `$executeRawUnsafe`)

### Authentication
- JWT-based with access + refresh tokens
- Global APP_GUARD chain: ThrottlerGuard → JwtAuthGuard
- `@Public()` decorator bypasses auth for specific endpoints
- bcrypt with `BCRYPT_SALT_ROUNDS` from shared package

### Security
- Helmet with CSP headers
- CORS from environment variable (no hardcoded origins)
- ValidationPipe with `whitelist: true, forbidNonWhitelisted: true`
- Rate limiting: ThrottlerModule with named configs (default + auth)

### Monitoring
- Pino structured logging with correlation IDs
- `formatLogEntry()` and `sanitizeLogContext()` from shared package
- GlobalExceptionFilter (APP_FILTER) with correlation in error responses
- ResponseTimeInterceptor (APP_INTERCEPTOR) adds X-Response-Time header
- Health endpoints: `/health` (basic), `/health/ready` (DB), `/metrics`

### Data Model
- All Prisma models use `@@map("snake_case")` for table names
- Enums use `@@map` and `@map` for PostgreSQL naming
- Ticket prices: `Decimal @db.Decimal(12, 2)` — never Float
- Composite indexes on (organizationId, status) and other high-query fields

## Convention Gates

- Zero `as any` casts
- Zero `console.log` in `apps/api/src/`
- Zero `|| 'value'` fallbacks (use `??` or env validation)
- Zero `$executeRawUnsafe` calls
- `findFirst` calls in `*.service.ts` must have justification comment on preceding line

## Shared Package Exports (exactly 8)

1. `BCRYPT_SALT_ROUNDS` — bcrypt cost factor
2. `ALLOWED_REGISTRATION_ROLES` — role whitelist for registration
3. `APP_VERSION` — application version string
4. `clampPagination` — pagination helper (MAX_PAGE_SIZE/DEFAULT_PAGE_SIZE internal)
5. `createCorrelationId` — UUID-based correlation ID generator
6. `formatLogEntry` — structured log formatter
7. `sanitizeLogContext` — redacts sensitive fields from log context
8. `validateEnvVars` — environment variable validation with process.exit(1)

## Spec Traceability

- Tag prefix: EM-
- 8 spec files in `specs/` with VERIFY tags (35+ total)
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

- **Dockerfile**: Multi-stage (deps → build → production), node:20-alpine, USER node
- **Docker Compose**: PostgreSQL 16 with pg_isready healthcheck, named volume
- **CI**: GitHub Actions with PostgreSQL service container, lint/test/build/typecheck/audit
- **Environment**: All vars validated at startup, documented in .env.example

## Frontend

- Dark mode: `@media (prefers-color-scheme: dark)` in globals.css (NOT .dark class)
- 9 shadcn/ui-style components in `components/ui/`
- `cn()` utility with `clsx` + `tailwind-merge`
- Server actions in `lib/actions.ts` with `'use server'`
- Loading states: `role="status"` + `aria-busy="true"`
- Error boundaries: `role="alert"` + `useRef` + focus management
