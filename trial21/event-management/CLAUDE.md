# Event Management Platform — CLAUDE.md

## Project Overview
Multi-tenant event management platform built with NestJS 11 + Next.js 15 + Prisma 6.
Handles event lifecycle, ticketing, QR check-in, waitlist management, and notifications.

## Architecture

### Monorepo Structure
```
apps/api     — NestJS 11 REST API (port 3001)
apps/web     — Next.js 15 frontend (port 3000)
packages/shared — Shared constants, utilities, validators
```

### Tech Stack
- Runtime: Node.js 20+
- API: NestJS 11 with Passport JWT, class-validator, Prisma 6
- Frontend: Next.js 15 with React 19, server actions
- Database: PostgreSQL 16 with RLS
- Auth: JWT (1h access, 7d refresh), bcryptjs
- Logging: Pino structured logging
- Package Manager: pnpm 9.15.4 with Turborepo

## Key Decisions

### Authentication
- JWT access tokens expire in 1 hour (no hardcoded secrets)
- JWT_SECRET and JWT_REFRESH_SECRET validated at startup via validateEnvVars
- Global JwtAuthGuard + ThrottlerGuard + RolesGuard as APP_GUARD
- @Public() decorator bypasses auth for health, metrics, public endpoints
- Login/register rate limited to 10 requests/second

### Data Model
- All timestamps stored in UTC, displayed in event timezone
- Ticket prices stored as integers (cents) to avoid floating-point issues
- Event capacity = sum of ticket type quotas
- Registration status machine: PENDING -> CONFIRMED -> CHECKED_IN (or CANCELLED)
- Waitlist auto-promotes FIFO on cancellation

### Multi-Tenancy
- Organization-scoped data with RLS (ENABLE + FORCE + CREATE POLICY)
- tenant_id as TEXT (no ::uuid cast)
- All tenant-scoped queries use findFirst with organizationId filter

### Frontend Integration
- Server actions use cookies().set('token', data.access_token) for login
- Protected requests use cookies().get('token') with Authorization: Bearer header
- Route strings match NestJS controller paths exactly

## Development Commands
```bash
pnpm install                    # Install dependencies
pnpm turbo run build           # Build all packages
pnpm turbo run test            # Run all tests
pnpm turbo run lint            # Lint all packages
pnpm turbo run typecheck       # Type check all packages
```

## Testing Strategy
- Co-located unit tests: src/{module}/{module}.service.spec.ts
- Integration tests: test/*.spec.ts
- Edge case tests: test/edge-cases.spec.ts
- Security tests: test/security.spec.ts
- No inline fixtures (centralized in test/helpers/fixtures.ts)
- Assertion density >= 2 expects per test
- Coverage target: >= 60% branch coverage

## Module Architecture
Each domain module follows the pattern:
- {module}.module.ts — NestJS module definition
- {module}.controller.ts — HTTP handlers
- {module}.service.ts — Business logic
- {module}.dto.ts — Validation DTOs
- {module}.service.spec.ts — Co-located unit tests

## Security Conventions (Zero Tolerance)
- No `as any` — use proper types
- No `console.log` — use Pino logger
- No `||` fallbacks — use `??` (nullish coalescing)
- No `$executeRawUnsafe` — use `$executeRaw` with tagged templates
- No `dangerouslySetInnerHTML`
- All findFirst calls have justification comments
- All string DTOs: @IsString() + @MaxLength()
- UUID fields: @MaxLength(36)

## VERIFY Tag Format
- Prefix: EM (Event Management)
- Format: EM-{DOMAIN}-{NNN}
- Domains: AUTH, SEC, EVT, REG, CHK, WTL, NTF, AUD, API, MON, INF, FE, TST, EDGE, VEN, TKT, DM

## Environment Variables
Required:
- DATABASE_URL — PostgreSQL connection string
- JWT_SECRET — JWT signing key (no default in production)
- JWT_REFRESH_SECRET — Refresh token key (no default in production)

Optional:
- PORT — Server port (default: 3001)
- CORS_ORIGIN — Allowed origin (default: http://localhost:3000)
- NODE_ENV — Environment (development/production)
- API_URL — API base URL for frontend (default: http://localhost:3001)

## Docker
- Multi-stage build: builder + production
- Production stage copies shared/dist for runtime
- HEALTHCHECK on /health
- USER node for security
- docker-compose includes PostgreSQL + API + Web
