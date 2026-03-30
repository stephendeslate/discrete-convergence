# Analytics Engine

## Project Overview
- **Name:** Analytics Engine (AE)
- **Domain:** Real-time analytics dashboard platform
- **Trial:** 7 (discrete-convergence experiment)
- **Layers:** L0-L9 (all converged)
- **Version:** 1.0.0 (APP_VERSION from shared)

## Architecture

### Monorepo Structure
```
analytics-engine/
  apps/api/        # NestJS 11 backend API
  apps/web/        # Next.js 15 frontend
  packages/shared/ # Shared constants, utilities, types
```

### Tech Stack
- **Backend:** NestJS 11, Prisma 6, PostgreSQL 16
- **Frontend:** Next.js 15, React 19, Tailwind CSS 4, shadcn/ui
- **Monorepo:** Turborepo 2, pnpm workspaces
- **Auth:** JWT + bcrypt (salt rounds 12)
- **Logger:** Pino (structured JSON)
- **Runtime:** Node.js 20 (Alpine)

## Domain Entities
- **Tenant:** Multi-tenant isolation, slug-based identification
- **User:** Email/password auth, roles (ADMIN, USER, VIEWER)
- **Dashboard:** Analytics dashboards with status (ACTIVE, ARCHIVED, DRAFT)
- **Widget:** Dashboard components (CHART, TABLE, METRIC, MAP) with position/size
- **DataSource:** External data connections (POSTGRESQL, MYSQL, REST_API, CSV)
- **AuditLog:** Immutable audit trail (CREATE, UPDATE, DELETE, LOGIN, LOGOUT)

## Key Design Decisions

### Authentication & Authorization
- JWT-based auth with bcrypt password hashing (12 salt rounds)
- Global JwtAuthGuard via APP_GUARD — all routes protected by default
- @Public() decorator exempts specific routes (health, auth, metrics)
- RolesGuard for RBAC — @Roles() decorator on admin-only endpoints
- ALLOWED_REGISTRATION_ROLES excludes ADMIN from self-registration

### Security
- Helmet.js CSP: default-src 'self', frame-ancestors 'none'
- ThrottlerModule with named configs: 'default' (100/min) and 'auth' (5/min)
- ValidationPipe: whitelist + forbidNonWhitelisted + transform
- CORS: strict origin from env, credentials true
- GlobalExceptionFilter sanitizes all error responses (no stack traces)
- Row Level Security on all tables

### Monitoring
- Pino structured JSON logging (DI-injectable)
- CorrelationIdMiddleware: preserves/generates X-Correlation-ID
- RequestLoggingMiddleware: logs method, URL, status, duration
- GET /health: status, timestamp, uptime, version
- GET /health/ready: DB connectivity check via $queryRaw
- GET /metrics: request/error counts, avg response time

### Performance
- ResponseTimeInterceptor as APP_INTERCEPTOR (X-Response-Time header)
- Pagination: MAX_PAGE_SIZE=100, DEFAULT_PAGE_SIZE=20, clamping (not rejection)
- Cache-Control headers on all list endpoints
- @@index on tenantId, status, composite indexes
- Prisma include for N+1 prevention
- connection_limit in DATABASE_URL

### Frontend Patterns
- Dark mode via @media (prefers-color-scheme: dark) in globals.css
- cn() utility using clsx + tailwind-merge
- All loading.tsx: role="status" + aria-busy="true"
- All error.tsx: role="alert" + useRef + focus management with tabIndex={-1}
- Server Actions with 'use server' checking response.ok before redirect
- next/dynamic for code splitting with Skeleton loading states
- 8+ shadcn/ui components in components/ui/

## Code Conventions
- Zero `as any` type assertions
- Zero `console.log` in apps/api/src/
- Zero `|| 'value'` env var fallbacks (use ?? or validation)
- Zero `dangerouslySetInnerHTML`
- Zero `$executeRawUnsafe`
- All `findFirst` in *.service.ts have justification comments
- TRACED tags only in .ts/.tsx files

## Testing Strategy
- **Unit tests:** Auth, Dashboard, DataSource services with mocked Prisma
- **Integration tests:** Auth, Dashboard with supertest + real AppModule compilation
- **Cross-layer:** Full pipeline test (auth -> CRUD -> error -> correlation -> response time)
- **Security:** Protected endpoints, invalid tokens, role enforcement
- **Performance:** Response time headers, pagination clamping, Cache-Control
- **Monitoring:** Health, readiness, metrics, error reporting
- **Accessibility:** jest-axe on real components
- **Keyboard:** userEvent tab/enter/space tests
- **Log sanitizer:** Deep nested, arrays, sensitive keys

## Environment Variables
### Required
- DATABASE_URL — PostgreSQL connection string (with connection_limit)
- JWT_SECRET — Secret for JWT signing
- CORS_ORIGIN — Allowed CORS origin

### Optional
- PORT — Server port (default: 3000)
- NODE_ENV — Environment (development/production)
- LOG_LEVEL — Pino log level (default: info)
- API_URL — Backend URL for frontend (default: http://localhost:3000)

## Commands
```bash
pnpm install          # Install dependencies
pnpm turbo run build  # Build all packages
pnpm turbo run test   # Run all tests
pnpm turbo run lint   # Run ESLint
pnpm turbo run typecheck  # TypeScript type checking
```

## VERIFY/TRACED Tag Conventions
- **Prefix:** AE (Analytics Engine)
- **Format:** AE-{DOMAIN}-{NNN} (e.g., AE-AUTH-001, AE-DASH-002)
- **Specs:** VERIFY: AE-{DOMAIN}-{NNN} tags in spec markdown files
- **Code:** TRACED:AE-{DOMAIN}-{NNN} comments in .ts/.tsx files only
- **No human-readable tags** (e.g., no VERIFY: auth-register)
- **Bidirectional parity:** Every VERIFY has a TRACED, every TRACED has a VERIFY
