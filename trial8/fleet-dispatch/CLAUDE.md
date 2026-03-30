# Fleet Dispatch - Project Instructions

## Overview
Fleet management and dispatch platform with vehicles, drivers, routes, trips, and maintenance records.
Multi-tenant with RBAC (ADMIN, USER, DISPATCHER roles).

## APP_VERSION
Current version: 1.0.0 (sourced from @fleet-dispatch/shared)

## Tech Stack
- **Backend:** NestJS 11, Prisma 6.x, PostgreSQL 16+
- **Frontend:** Next.js 15, React 19, Tailwind CSS 4
- **Monorepo:** Turborepo 2.x, pnpm workspaces
- **Auth:** JWT + bcrypt (salt rounds 12)
- **Logging:** Pino structured JSON

## Project Structure
```
fleet-dispatch/
  apps/api/      - NestJS backend API
  apps/web/      - Next.js frontend
  packages/shared/ - Shared utilities and constants
  specs/         - Specification documents
```

## Development Commands
```bash
pnpm install          # Install all dependencies
pnpm turbo run build  # Build all packages
pnpm turbo run test   # Run all tests
pnpm turbo run lint   # Lint all packages
pnpm turbo run typecheck # Type check all packages
```

## Architecture Decisions

### Authentication
- JWT tokens with 24h expiry
- Passwords hashed with bcrypt (12 salt rounds from shared BCRYPT_SALT_ROUNDS)
- Registration restricted to USER and DISPATCHER roles (ADMIN excluded)
- Token stored in httpOnly secure cookie after login

### Multi-Tenancy
- All domain entities include tenantId field
- Row Level Security (RLS) enabled on all tables
- Every service method receives tenantId from authenticated user
- Controllers extract tenantId from req.user

### Security
- Helmet with strict CSP (default-src 'self', frame-ancestors 'none')
- CORS restricted to CORS_ORIGIN env var (no fallback)
- Rate limiting: 100 req/min default, 5 req/min for auth
- Global guards: ThrottlerGuard + JwtAuthGuard + RolesGuard
- ValidationPipe: whitelist + forbidNonWhitelisted + transform
- No console.log in production code (use LoggerService)

### Monitoring
- Pino structured JSON logging
- Correlation ID middleware (preserves or generates)
- Request logging middleware with formatLogEntry
- Global exception filter with sanitized error context
- Health endpoints: GET /health, GET /health/ready, GET /metrics
- Frontend error boundary with POST /errors

### Performance
- ResponseTimeInterceptor adds X-Response-Time header
- Pagination clamped to MAX_PAGE_SIZE=100
- Cache-Control headers on list endpoints
- Database indexes on tenantId, status, composite keys

### Shared Package Exports
- BCRYPT_SALT_ROUNDS, ALLOWED_REGISTRATION_ROLES
- MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE, APP_VERSION
- createCorrelationId, formatLogEntry
- sanitizeLogContext (redacts sensitive fields)
- validateEnvVars, clampPagination

## Database
- Prisma with PostgreSQL
- Decimal(12,2) for monetary fields (cost, distance)
- All models use @@map('snake_case')
- All enums use @@map + @map on values
- RLS policies for tenant isolation

## Testing
- Integration tests: supertest with real AppModule
- Unit tests: mocked Prisma
- Security tests: auth failures, role enforcement
- Monitoring tests: health, metrics, sanitizer
- Performance tests: response time, pagination
- Frontend: jest-axe accessibility, keyboard navigation

## Environment Variables
- DATABASE_URL (with connection_limit)
- JWT_SECRET
- CORS_ORIGIN
- PORT
- NODE_ENV
- APP_VERSION
- NEXT_PUBLIC_API_URL
