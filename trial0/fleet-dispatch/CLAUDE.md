# FleetDispatch — Project Instructions

## Architecture

FleetDispatch is a multi-tenant field service dispatch platform built as a Turborepo
monorepo with three packages:

- `apps/api` — NestJS 11 REST API + WebSocket gateways
- `apps/web` — Next.js 15 App Router frontend
- `packages/shared` — Shared utilities, constants, and types

## Technology Stack

- **Runtime**: Node.js 20, pnpm 9.15.4
- **API**: NestJS 11, Prisma 6, PostgreSQL 16, socket.io
- **Frontend**: Next.js 15, React 19, Tailwind CSS 4, TypeScript 5
- **Testing**: Vitest, Jest, supertest, jest-axe, @testing-library/react

## Domain Concepts

### Work Order State Machine
9 states: UNASSIGNED → ASSIGNED → EN_ROUTE → ON_SITE → IN_PROGRESS → COMPLETED → INVOICED → PAID
CANCELLED allowed from any state except PAID.
VALID_TRANSITIONS map enforces valid transitions in work-order.service.ts.

### Invoice State Machine
DRAFT → SENT → PAID. VOID from DRAFT or SENT.
Only COMPLETED work orders can be invoiced.

### GPS Tracking
WebSocket gateway at /gps namespace handles real-time position updates.
Tracking tokens generated on EN_ROUTE transition, expire after 24 hours.

### Dispatch
WebSocket gateway at /dispatch namespace broadcasts assignments and status changes.

## Multi-Tenancy

- All queries scoped by companyId from JWT payload
- RLS (Row Level Security) enabled on all tenant-scoped tables
- RLS uses current_setting('app.company_id') for policy enforcement

## API Module Structure (13 domain modules)

AuthModule, WorkOrderModule, TechnicianModule, CustomerModule,
RouteModule, GpsModule, InvoiceModule, TrackingModule, PhotoModule,
NotificationModule, AuditModule, DispatchModule, MonitoringModule

## Global Providers (AppModule)

- APP_GUARD: ThrottlerGuard (rate limiting), JwtAuthGuard (authentication)
- APP_FILTER: GlobalExceptionFilter (error handling)
- APP_INTERCEPTOR: ResponseTimeInterceptor (performance tracking)
- CorrelationIdMiddleware and RequestLoggingMiddleware applied globally

## Shared Package Exports (10+)

BCRYPT_SALT_ROUNDS, ALLOWED_REGISTRATION_ROLES, MAX_PAGE_SIZE, APP_VERSION,
createCorrelationId, formatLogEntry, sanitizeLogContext, validateEnvVars,
clampPage, clampLimit, paginationMeta, DEFAULT_PAGE_SIZE, GPS_BATCH_SIZE,
GPS_RETENTION_DAYS, TRACKING_TOKEN_EXPIRY_HOURS, MAX_WORK_ORDER_PHOTOS,
ROUTE_CACHE_TTL_SECONDS

## Convention Gates

- Zero `as any` casts
- Zero `console.log` in apps/api/src (use LoggerService)
- Zero `|| 'value'` fallbacks (use validateEnvVars or ?? with explicit defaults)
- Zero `$executeRawUnsafe` calls
- Zero `dangerouslySetInnerHTML` in frontend
- All `findFirst` calls have justification comments

## Traceability

- VERIFY tags in specs use FD-* prefix
- TRACED tags in source files reference VERIFY tags
- Bidirectional parity: every VERIFY has a corresponding TRACED

## Frontend Patterns

- Dark mode: @media (prefers-color-scheme: dark) — NOT .dark class
- Loading: role="status" + aria-busy="true" + Skeleton + sr-only text
- Error: role="alert" + useRef<HTMLDivElement> + useEffect focus + tabIndex={-1}
- 11 shadcn/ui-style components using cn() with clsx + tailwind-merge
- Server actions for auth (loginAction, registerAction)

## Database

- 14 Prisma models, 8 enums
- All models use @@map for snake_case table names
- All enums use @map for snake_case values
- @@index on companyId, status, and composite fields
- Migrations include RLS policy creation
- Seed creates demo company with all entity types

## Testing

- 3 unit tests: auth.service, work-order.service, invoice.service
- 5 integration tests: auth, work-order, monitoring, security, performance
- 2 frontend tests: accessibility (jest-axe), keyboard navigation (userEvent)
- Tests follow TRACED:FD-TEST-* pattern

## Commands

```bash
pnpm install           # Install dependencies
pnpm turbo build       # Build all packages
pnpm turbo test        # Run all tests
pnpm turbo lint        # Lint all packages
cd apps/api && npx prisma migrate deploy  # Run migrations
cd apps/api && npx prisma db seed         # Seed database
```
