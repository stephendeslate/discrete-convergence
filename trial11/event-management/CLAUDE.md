# Event Management System

## Project Overview

Multi-tenant event management application built with CED v1.2-dc methodology.
NestJS 11 API backend, Next.js 15 frontend, shared packages monorepo.

## Architecture

- **Monorepo**: Turborepo + pnpm workspaces
- **Backend**: NestJS 11, Prisma ORM, PostgreSQL with RLS
- **Frontend**: Next.js 15, server actions, shadcn/ui, Tailwind CSS
- **Shared**: Constants, utilities, types shared across apps

## Key Directories

```
apps/api/          - NestJS backend (port 3001)
apps/web/          - Next.js frontend (port 3000)
packages/shared/   - Shared constants and utilities
specs/             - CED specification documents
```

## Development Commands

```bash
pnpm install                    # Install all dependencies
pnpm turbo run build            # Build all packages
pnpm turbo run test             # Run all tests
pnpm turbo run lint             # Lint all packages
pnpm turbo run typecheck        # Type check all packages
```

## Database

- PostgreSQL 16 via docker-compose
- Prisma ORM with schema at apps/api/prisma/schema.prisma
- Row Level Security on all tables (TEXT comparison, no ::uuid cast)
- Seed: `cd apps/api && npx prisma db seed`

## Authentication

- JWT-based with bcryptjs (NOT bcrypt)
- BCRYPT_SALT_ROUNDS=12 from shared package
- Roles: ADMIN, ORGANIZER, USER
- Self-registration limited to USER and ORGANIZER only
- Token stored in httpOnly cookie on frontend

## Security Layers

1. ThrottlerModule with named rate limit configs
2. JwtAuthGuard (global, bypassed by @Public())
3. RolesGuard with @Roles() decorator
4. ValidationPipe with whitelist + forbidNonWhitelisted
5. Helmet CSP headers
6. CORS with configurable origins
7. PostgreSQL RLS for tenant isolation

## API Guards (APP_GUARD order)

1. ThrottlerGuard - rate limiting
2. JwtAuthGuard - authentication
3. RolesGuard - authorization

## Global Providers

- APP_FILTER: GlobalExceptionFilter (sanitizes logs)
- APP_INTERCEPTOR: ResponseTimeInterceptor (X-Response-Time header)

## Monitoring Endpoints (all @Public)

- GET /health - Health check with uptime
- GET /readiness - Database connectivity check
- GET /metrics - System performance metrics

## Pagination

- MAX_PAGE_SIZE=100 from shared (clamped in clampPagination)
- DEFAULT_PAGE_SIZE=20
- All list endpoints use PaginatedQueryDto

## Spec Traceability

- VERIFY tags in specs/*.md files
- TRACED tags in *.ts/*.tsx source files
- Bidirectional parity: 66 tags, 0 orphans
- Tag format: EM-{DOMAIN}-{NNN}

## Testing

- API unit tests: apps/api/test/*.service.spec.ts
- API integration tests: apps/api/test/*.integration.spec.ts
- API security/perf: apps/api/test/security.spec.ts, performance.spec.ts
- Frontend tests: apps/web/__tests__/*.spec.tsx
- Frontend tests import real components (not inline fixtures)

## Environment Variables

```
DATABASE_URL=postgresql://user:pass@localhost:5432/eventmgmt
JWT_SECRET=your-secret-key
API_PORT=3001
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
API_URL=http://localhost:3001
```

## Docker

```bash
docker-compose up -d            # Start PostgreSQL
docker-compose -f docker-compose.test.yml up  # Test environment
```

## Important Constraints

- Never use `bcrypt` - always `bcryptjs`
- RLS policies use TEXT comparison (no ::uuid cast)
- All controllers scope by tenant via @Req() or are @Public()
- Monitoring controller is fully @Public()
- pnpm.overrides: effect>=3.20.0 (Prisma transitive vuln fix)
- Frontend server actions use API_ROUTES from shared for route consistency
