# Fleet Dispatch — Project Instructions

## Project Overview

Fleet Dispatch is a fleet management system built as a Turborepo monorepo.
It manages vehicles, drivers, routes, dispatches, and maintenance records
with multi-tenant isolation via JWT authentication and row-level security.

## Architecture

- **apps/api** — NestJS 11 REST API with Prisma ORM and PostgreSQL
- **apps/web** — Next.js 15 frontend with React 19 and Tailwind CSS 4
- **packages/shared** — Cross-cutting utilities shared by both apps

## Tech Stack

| Component | Version |
|-----------|---------|
| NestJS | ^11.0.0 |
| Prisma | >=6.0.0 <7.0.0 |
| Next.js | ^15.0.0 |
| React | ^19.0.0 |
| Tailwind CSS | ^4.0.0 |
| Node.js | 20 (Alpine in Docker) |
| PostgreSQL | 16 |
| pnpm | 9.15.4 |
| Turborepo | ^2.0.0 |

## Development Setup

```bash
# Start PostgreSQL
docker compose up -d postgres

# Install dependencies
pnpm install

# Run Prisma migrations
cd apps/api && npx prisma migrate dev

# Seed database
cd apps/api && npx prisma db seed

# Start all apps
pnpm turbo run dev
```

## Build & Test Commands

```bash
pnpm turbo run build      # Build all packages
pnpm turbo run lint        # Lint all packages
pnpm turbo run typecheck   # Type check all packages
pnpm turbo run test        # Run all tests
```

## Key Conventions

### Authentication
- JWT-based auth with bcryptjs (pure JS, no native deps)
- Salt rounds: 12 (from shared constants)
- Token stored in httpOnly cookie on frontend
- All non-@Public() endpoints require JWT

### Security
- Helmet with CSP headers
- ThrottlerGuard as global APP_GUARD (default: 100/60s, auth: 5/60s)
- JwtAuthGuard as global APP_GUARD
- RolesGuard as global APP_GUARD
- GlobalExceptionFilter as APP_FILTER (no stack trace leaks)
- ResponseTimeInterceptor as APP_INTERCEPTOR
- CORS from CORS_ORIGIN env var (no fallback)
- ValidationPipe: whitelist + forbidNonWhitelisted + transform

### Data Architecture
- All models use @@map for snake_case table names
- @@index on tenantId and status columns
- Decimal(12,2) for monetary fields (maintenance cost)
- RLS policies with TEXT comparison (no ::uuid cast)
- Multi-tenant isolation via req.user.tenantId

### Monitoring
- Pino structured JSON logging
- Correlation IDs via X-Correlation-Id header
- Request/response logging middleware
- Health check: GET /health, GET /health/ready
- Metrics: GET /metrics

### Code Quality Rules
- Zero `as any` casts
- Zero `|| 'fallback'` env patterns (use `??` or validateEnvVars)
- All server action exports must be async
- findFirst calls must have justification comments
- API route constants use single-quoted strings

### Traceability
- Tag prefix: FD-
- 68 VERIFY/TRACED tag pairs across 16 domains
- Zero orphan tags in either direction
- TRACED comments only in .ts/.tsx files

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | PostgreSQL connection string |
| JWT_SECRET | Yes | JWT signing secret |
| CORS_ORIGIN | Yes | Allowed CORS origin |
| NODE_ENV | No | development/test/production |
| PORT | No | API port (default 3001) |
| API_URL | No | Full API base URL |
| LOG_LEVEL | No | Pino log level (default info) |

## Testing Strategy

- Unit tests: service logic with mocked Prisma
- Integration tests: supertest with real AppModule compilation
- Security tests: auth, RBAC, validation, error sanitization
- Performance tests: response time, pagination, caching
- Accessibility tests: jest-axe, keyboard navigation
- Cross-layer tests: full pipeline verification
