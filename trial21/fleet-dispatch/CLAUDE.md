# Fleet Dispatch — CLAUDE.md

## Section 1: Project Overview
Fleet Dispatch is a multi-tenant field service dispatch platform built as a NestJS 11 + Next.js 15 + Prisma 6
monorepo. It manages work orders, GPS tracking, route optimization, invoicing, and real-time technician tracking
via Leaflet maps. The project uses pnpm workspaces with Turborepo for build orchestration.

## Section 2: Architecture
- **apps/api**: NestJS 11 REST API with Prisma ORM, JWT auth, RBAC, and rate limiting
- **apps/web**: Next.js 15 App Router with React 19, server components, server actions
- **packages/shared**: Shared constants, utilities, and validators (9 exports)
- Multi-tenant via tenantId (TEXT) on all business entities
- Company-scoped sequences for work orders (WO-NNNNN) and invoices (INV-NNNNN)

## Section 3: Key Commands
```bash
pnpm install                    # Install all dependencies
pnpm turbo run build            # Build all packages
pnpm turbo run test             # Run all tests
pnpm turbo run lint             # Lint all packages
pnpm turbo run typecheck        # Type-check all packages
pnpm --filter @fleet-dispatch/api run test   # API tests only
pnpm --filter @fleet-dispatch/web run test   # Web tests only
```

## Section 4: Domain Model
- Company (tenant), User (ADMIN/DISPATCHER/TECHNICIAN/CUSTOMER)
- Technician (skills[], GPS Decimal(10,7), schedule)
- Customer (geocoded address, magic-link portal)
- WorkOrder: UNASSIGNED→ASSIGNED→EN_ROUTE→ON_SITE→IN_PROGRESS→COMPLETED→INVOICED→PAID
  - CANCELLED from any except PAID
  - trackingToken: UUID, 24h expiry
- Invoice: DRAFT→SENT→PAID, VOID from DRAFT/SENT, immutable after SENT
- LineItem (labor/material/flat-rate/discount/tax), monetary: Decimal(12,2)
- Route, RouteStop, JobPhoto, Notification, AuditLog, GpsReading

## Section 5: API Endpoints
Auth: POST /auth/login, /auth/register, /auth/refresh
Companies: GET/PATCH /companies/me
Work Orders: CRUD + status + assign at /work-orders
Technicians: CRUD + available + schedule + GPS at /technicians
Customers: CRUD + work-orders at /customers
Routes: POST /routes/optimize, GET /:date, PATCH /:id/reorder
Invoices: POST /invoices/work-orders/:id, send/pay/void, GET list
Photos: POST/GET /work-orders/:id/photos
Notifications: GET /notifications, PATCH /:id/read
Tracking: GET /track/:token (public)
Health: GET /health, /health/ready (public)
Metrics: GET /metrics, Monitoring: GET /monitoring
Placeholders: GET /dashboards, GET /data-sources (return [])

## Section 6: Security
- Global JwtAuthGuard + ThrottlerGuard + RolesGuard as APP_GUARD
- bcryptjs (NOT bcrypt), 12 salt rounds
- Helmet CSP frame-ancestors:'none', x-powered-by disabled
- ValidationPipe (whitelist + forbidNonWhitelisted)
- Rate limiting: short(1000/100), medium(10000/500), long(60000/2000)
- Auth endpoints: @Throttle({short:{ttl:1000,limit:10}})
- tenantId TEXT, no ::uuid cast, all queries scoped

## Section 7: Testing
- Co-located unit tests: src/{module}/{module}.service.spec.ts
- Test helpers: test/helpers/mock-prisma.ts, test/helpers/factories.ts
- No inline fixtures — all test data from factory functions
- jest.config.js: roots include src/ and test/
- Coverage: json-summary reporter, 60% branch threshold
- 30+ test cases across 15+ test files

## Section 8: Conventions
- Zero: as any, console.log, || fallbacks, $executeRawUnsafe, dangerouslySetInnerHTML
- findFirst: requires justification comment
- TRACED: only in .ts/.tsx files
- DTOs: class-validator decorators on all fields
- Prisma: @@map, @@index, Decimal(10,7) for GPS, Decimal(12,2) for money
- ESLint: flat config (eslint.config.mjs), NOT .eslintrc.json
- TypeScript: strict mode enabled
- Shared package: 9 exports, zero dead code
- Leaflet + OpenStreetMap only (NOT Google Maps)
- next/dynamic with {ssr:false} for map components
- Frontend: html lang="en", semantic headings, labels, alt text
- Server actions: cookies().set('token', data.access_token)
- Protected actions: cookies().get('token'), Authorization: Bearer

## Section 9: Infrastructure
- Dockerfile: multi-stage, prisma generate before tsc
- Production stage: COPY packages/shared/package.json + packages/shared/dist/
- HEALTHCHECK, USER node, PORT env var
- docker-compose.yml: api, db (postgres:16), web services
- CI: GitHub Actions (pnpm install → build → lint → test)
- main.ts: validateEnvVars, enableShutdownHooks, process.env.PORT

## Section 10: Spec Traceability
- VERIFY tag prefix: FD-{DOMAIN}-{NNN}
- 55+ VERIFY entries in SPEC-INDEX.md
- All specs: authentication.md, data-model.md, api-endpoints.md, frontend.md,
  security.md, infrastructure.md, monitoring.md, SPEC-INDEX.md
- Each spec file: 55+ lines, 2+ cross-references
- TRACED only in .ts/.tsx files, 100% bidirectional parity
