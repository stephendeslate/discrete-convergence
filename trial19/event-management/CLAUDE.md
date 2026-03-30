# Event Management — Project Instructions

## Architecture

Turborepo monorepo with three packages:
- `apps/api` — NestJS 11 REST API with Prisma ORM, JWT auth, RBAC
- `apps/web` — Next.js 15 frontend with App Router, server actions
- `packages/shared` — TypeScript utility library consumed by both apps

## Tech Stack

- **Runtime:** Node.js 20
- **Package Manager:** pnpm with workspaces
- **API Framework:** NestJS 11 with Prisma ORM (PostgreSQL)
- **Frontend:** Next.js 15, App Router, shadcn/ui-style components
- **Auth:** JWT (access + refresh), bcryptjs for hashing
- **Testing:** Jest, supertest, @testing-library/react, jest-axe
- **Build:** Turborepo for task orchestration

## Commands

```bash
# Install dependencies
pnpm install

# Development
pnpm run dev

# Build all packages
pnpm run build

# Run all tests
pnpm run test

# Run API tests only
cd apps/api && pnpm test

# Run web tests only
cd apps/web && pnpm test

# Lint all packages
pnpm run lint

# Type check all packages
pnpm run typecheck

# Generate Prisma client
cd apps/api && npx prisma generate

# Run database migrations
cd apps/api && npx prisma migrate dev

# Seed database
cd apps/api && npx prisma db seed
```

## Code Conventions

### TypeScript
- Strict mode enabled in all packages
- Zero `as any` casts in production code
- Zero `console.log` in apps/api/src (use structured logging)
- Zero `|| 'value'` env fallbacks (use validateEnvVars)
- All `findFirst` calls must have a justification comment

### API Architecture
- Global guards: ThrottlerGuard → JwtAuthGuard → RolesGuard
- Global filter: GlobalExceptionFilter
- Global interceptor: ResponseTimeInterceptor
- @Public() decorator bypasses auth on health, login, register
- @Roles('ADMIN') on create/update/delete endpoints
- All domain queries filter by req.user.tenantId

### Frontend Architecture
- Server actions in lib/actions.ts for all API calls
- Cookie-based auth (httpOnly, secure)
- Every route has loading.tsx (role="status", aria-busy) and error.tsx (role="alert", auto-focus)
- Components in components/ui/ follow shadcn/ui patterns

### Testing
- API unit tests co-located in src/{module}/*.spec.ts
- API integration tests in test/*.spec.ts
- Frontend tests in __tests__/*.spec.tsx
- Jest coverage with json-summary reporter, 60%+ branch target
- Behavioral assertions (toHaveBeenCalledWith, not just toBeDefined)

### Traceability
- VERIFY tags in specs/ link to TRACED tags in source code
- Prefix format: EM-{DOMAIN}-{NNN}
- Edge cases in specs/edge-cases.md with EC- prefix
- SPEC-INDEX.md tracks all tags and files

### Security
- x-powered-by disabled before middleware
- Helmet with CSP frame-ancestors:'none'
- CORS via CORS_ORIGIN env var
- ValidationPipe: whitelist + forbidNonWhitelisted + transform
- Rate limiting: 100/sec global, 3/sec on auth endpoints
- RLS at database level (ENABLE + FORCE + CREATE POLICY)
- Tenant ID compared as TEXT (no ::uuid cast)

### Database
- Prisma ORM with >=6.0.0 <7.0.0 version range
- pnpm.overrides for effect>=3.20.0 (Prisma transitive dep)
- Snake_case table/column names via @@map/@map
- Indexes on tenantId and composite (tenantId, status)

## Environment Variables

Required (validated at startup):
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — JWT signing secret
- `JWT_REFRESH_SECRET` — Refresh token signing secret

Optional:
- `CORS_ORIGIN` — Allowed CORS origin (default: none)
- `PORT` — API server port (default: 3001)
- `API_URL` — API base URL for web app (default: http://localhost:3001)

## Docker

```bash
# Start all services
docker compose up -d

# Start test database only
docker compose -f docker-compose.test.yml up -d

# Build production image
docker build -t event-management .
```
