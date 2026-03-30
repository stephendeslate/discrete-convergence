# Fleet Dispatch — CLAUDE.md

## Project Overview

Fleet Dispatch is a multi-tenant logistics management platform built as a
Turborepo monorepo with three workspaces:

- **apps/api** — NestJS 11 backend with Prisma ORM and PostgreSQL
- **apps/web** — Next.js 15 frontend with React 19 and Tailwind CSS 4
- **packages/shared** — Shared constants, utilities, and validators

## Quick Start

```bash
pnpm install
cp .env.example .env
docker compose up -d postgres
cd apps/api && npx prisma migrate dev && npx prisma db seed
cd ../.. && pnpm turbo run build
pnpm turbo run dev
```

## Common Commands

```bash
# Build all packages
pnpm turbo run build

# Run all tests
pnpm turbo run test

# Lint all packages
pnpm turbo run lint

# Type check all packages
pnpm turbo run typecheck

# Run specific package tests
pnpm turbo run test --filter=api
pnpm turbo run test --filter=web
pnpm turbo run test --filter=shared

# Database operations
cd apps/api && npx prisma migrate dev
cd apps/api && npx prisma db seed
cd apps/api && npx prisma studio
```

## Architecture

### Authentication Flow
1. User registers/logs in via POST /auth/register or POST /auth/login
2. API returns JWT token with userId, email, role, tenantId claims
3. Frontend stores token via cookies().set() in server action
4. Subsequent server actions read cookie and send Authorization: Bearer header

### Security Layers
- **APP_GUARD**: ThrottlerGuard → JwtAuthGuard → RolesGuard (in order)
- **APP_FILTER**: GlobalExceptionFilter (sanitizes errors, adds correlationId)
- **APP_INTERCEPTOR**: ResponseTimeInterceptor (tracks performance)
- **RLS**: PostgreSQL row-level security on all tables, TEXT tenant_id comparison

### Domain Modules
- **Vehicle**: CRUD for fleet vehicles (ADMIN-only delete)
- **Driver**: CRUD for drivers (ADMIN-only delete)
- **Dispatch**: CRUD for delivery dispatches with status tracking
- **Route**: CRUD for delivery routes with ordered stops

### Monitoring (all @Public + @SkipThrottle)
- GET /health — database connectivity check, uptime, version
- GET /metrics — request count, error count, avg response time

## Key Design Decisions

1. **bcryptjs over bcrypt** — Eliminates tar vulnerability chain from native bcrypt
2. **ESLint 9 flat config** — eslint.config.mjs format, not .eslintrc.json
3. **pnpm.overrides for effect>=3.20.0** — Fixes Prisma transitive vulnerability
4. **Global guards via APP_GUARD** — Ensures all endpoints are protected by default
5. **@Public() decorator** — Opt-out mechanism for auth and monitoring endpoints
6. **CSS variables for theming** — Dark mode via prefers-color-scheme media query
7. **Server actions (not API routes)** — Next.js 15 pattern for data fetching

## Testing Strategy

- **API unit tests**: Service-level with mocked Prisma (apps/api/test/*.service.spec.ts)
- **API integration tests**: Supertest with TestingModule (apps/api/test/*.integration.spec.ts)
- **Security tests**: Auth enforcement, validation, error sanitization
- **Performance tests**: Response time, concurrent requests, metrics tracking
- **Frontend tests**: Accessibility (jest-axe), keyboard navigation (userEvent)
- **Shared tests**: Log sanitizer with edge cases (arrays, nested objects)

## Traceability

All spec requirements use FD-* prefix tags:
- Specs contain `VERIFY: FD-XXX-NNN` tags
- Source code contains `// TRACED: FD-XXX-NNN` comments
- 63 bidirectional pairs with zero orphans

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | postgresql://user:pass@localhost:5432/fleet |
| JWT_SECRET | Secret for JWT signing | your-secret-key |
| CORS_ORIGIN | Allowed CORS origin | http://localhost:3001 |
| NODE_ENV | Environment | development |
| PORT | API server port | 3000 |
| THROTTLE_TTL | Rate limit window (seconds) | 60 |
