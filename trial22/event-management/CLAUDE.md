# Event Management Platform — CLAUDE.md

## Project Overview
Multi-tenant event management platform built with NestJS 11 (API) and Next.js 15 (Web).
Monorepo managed by Turborepo with pnpm workspaces.

## Architecture
- **apps/api**: NestJS 11 REST API with JWT auth, RBAC, multi-tenancy
- **apps/web**: Next.js 15 with server actions, Tailwind CSS
- **packages/shared**: Constants, utilities, validators shared across apps

## Tech Stack
- **Runtime**: Node.js 20
- **API Framework**: NestJS 11 with Express
- **Frontend**: Next.js 15 (App Router)
- **ORM**: Prisma 6 with PostgreSQL
- **Auth**: JWT (passport-jwt) + bcryptjs
- **Validation**: class-validator + class-transformer
- **Styling**: Tailwind CSS 3
- **Testing**: Jest + Supertest + Testing Library
- **Linting**: ESLint 9 (flat config)

## Key Patterns

### Multi-tenancy
- All entities scoped to tenantId via Prisma WHERE clauses
- RLS (Row Level Security) enabled on all tables with CREATE POLICY
- PrismaService.setTenantContext() for database-level tenant isolation

### Authentication & Authorization
- JWT access tokens (1h) and refresh tokens (7d)
- JwtAuthGuard as APP_GUARD (global, skip with @Public())
- RolesGuard as APP_GUARD for RBAC
- ThrottlerGuard as APP_GUARD with named configs (short/medium/long)
- Login/register endpoints use @Public() + @Throttle()

### Security
- Helmet with CSP (frame-ancestors: 'none')
- CORS from CORS_ORIGIN env var
- ValidationPipe with whitelist + forbidNonWhitelisted
- GlobalExceptionFilter sanitizes error responses
- No stack traces exposed to clients

### Monitoring
- Pino structured JSON logging
- X-Correlation-ID on all requests
- X-Response-Time interceptor
- Health endpoints at /health and /health/ready

## Build Commands
```bash
pnpm install           # Install dependencies
pnpm turbo run build   # Build all packages
pnpm turbo run lint    # Lint all packages
pnpm turbo run test    # Run all tests
pnpm turbo run typecheck  # Type check all packages
```

## Database
```bash
cd apps/api
npx prisma generate    # Generate Prisma client
npx prisma migrate dev # Run migrations
npx prisma db seed     # Seed database
```

## Environment Variables
See .env.example for required variables:
- DATABASE_URL
- JWT_SECRET
- JWT_REFRESH_SECRET
- PORT
- CORS_ORIGIN

## Domain Entities (14)
Tenant, User, Event, Venue, TicketType, Ticket, Attendee,
Registration, Speaker, Session, Sponsor, Category, Notification, AuditLog

## Conventions
- No `as any` in source code
- No `console.log` in apps/api/src/
- No `|| 'fallback'` env var patterns
- All findFirst calls have justification comments
- TRACED tags only in .ts/.tsx files
- All models use @@map, all enums use @@map + @map on values
- Decimal @db.Decimal(12,2) for money fields
- @@index on tenantId, status, composites

## Testing Strategy
- Co-located unit tests (*.spec.ts in src/{module}/)
- Integration tests (test/ with supertest)
- Frontend tests (__tests__/ with Testing Library)
- Shared package tests (__tests__/)
