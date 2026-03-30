# Fleet Dispatch — Project Instructions

## Overview

Fleet Dispatch is a multi-tenant fleet management and dispatch platform.
- **Backend**: NestJS 11, Prisma 6, PostgreSQL 16
- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Shared**: TypeScript utilities, constants, validation

## Architecture

### Monorepo Structure
```
apps/api/       — NestJS backend (port 3001)
apps/web/       — Next.js frontend (port 3000)
packages/shared/ — Shared utilities
```

### Domain Entities (14)
Tenant, User, Vehicle, Driver, Route, Trip, Stop, Dispatch,
MaintenanceRecord, FuelLog, Geofence, Alert, Notification, AuditLog

### Multi-Tenancy
- Every entity has a `tenantId` field
- JWT payload includes `tenantId`
- All queries filter by `tenantId` from request context
- PostgreSQL RLS policies enforce isolation at the database level
- PrismaService.setTenantContext uses `$executeRaw` (never `$executeRawUnsafe`)

## Commands

### Development
```bash
pnpm install           # Install all dependencies
pnpm turbo run build   # Build all packages
pnpm turbo run lint    # Lint all packages
pnpm turbo run test    # Run all tests
pnpm turbo run typecheck # Type check all packages
```

### Database
```bash
cd apps/api
npx prisma generate    # Generate Prisma client
npx prisma migrate dev # Run migrations
npx prisma db seed     # Seed database
```

### Docker
```bash
docker compose up -d           # Start all services
docker compose -f docker-compose.test.yml up -d  # Start test DB
```

## Code Standards

### TypeScript
- Strict mode enabled everywhere
- No `as any` casts
- No `console.log` (use NestJS Logger)
- No `|| 'fallback'` patterns (use `??`)
- No `$executeRawUnsafe`

### Testing
- Co-located `.spec.ts` files for every service and controller
- Integration tests in `apps/api/test/`
- Minimum 15 supertest calls across integration tests
- Assertion density >= 1.5 expects per test
- Use behavioral assertions (toHaveBeenCalledWith)

### API Design
- All endpoints tenant-scoped via `req.user.tenantId`
- Pagination via `parsePagination` from shared
- findFirst with justification comments (not findUnique) for tenant-scoped queries
- Global guards: JwtAuthGuard, ThrottlerGuard, RolesGuard
- Global filter: GlobalExceptionFilter
- Global interceptor: ResponseTimeInterceptor

### Frontend
- App Router with loading.tsx (role="status") and error.tsx (role="alert")
- Server actions for API communication with cookie-based auth
- All forms have accessible labels and aria attributes
- Dark mode via CSS media query

### Security
- bcryptjs (not bcrypt) for password hashing
- Helmet middleware
- CORS with specific origin
- Rate limiting on auth endpoints
- Input validation with class-validator
- RLS on all tables

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| DATABASE_URL | Yes | — | PostgreSQL connection string |
| JWT_SECRET | Yes | — | JWT signing secret |
| PORT | No | 3001 | API server port |
| CORS_ORIGIN | No | http://localhost:3000 | Allowed CORS origin |
| API_URL | No | http://localhost:3001 | Backend URL for frontend |

## Tracing

All TRACED tags use the FD- prefix (e.g., TRACED: FD-AUTH-001).
All VERIFY tags use the FD- prefix (e.g., VERIFY: FD-SEC-001).
