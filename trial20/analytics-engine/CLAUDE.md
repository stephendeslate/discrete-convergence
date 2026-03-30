# Analytics Engine — Project Instructions

## Overview

Multi-tenant analytics dashboard platform built with NestJS 11 (API), Next.js 15 (Web),
and a shared TypeScript package. Uses pnpm workspaces with Turborepo for monorepo management.

## Architecture

```
analytics-engine/
  apps/
    api/          NestJS 11 REST API with Prisma ORM
    web/          Next.js 15 App Router frontend
  packages/
    shared/       Constants, validators, sanitizers, pagination utilities
  specs/          Specification documents with VERIFY tags
```

## Quick Start

```bash
pnpm install
cd apps/api && npx prisma generate
pnpm turbo run build
pnpm turbo run test
pnpm turbo run lint
```

## Key Technical Decisions

### Authentication
- JWT with access token (1h) and refresh token (separate secret)
- bcryptjs (NOT bcrypt) to avoid native tar vulnerability chain
- Registration restricted to VIEWER role via ALLOWED_REGISTRATION_ROLES
- ADMIN accounts created only via database seeding

### Security
- Helmet with CSP (default-src 'self', frame-ancestors 'none')
- ThrottlerGuard globally at 100 req/sec, 10 req/sec on auth endpoints
- ValidationPipe: whitelist + forbidNonWhitelisted + transform
- RLS policies on all tables for defense-in-depth tenant isolation
- Zero $executeRawUnsafe usage anywhere

### Database
- Prisma ORM with PostgreSQL
- All models have tenantId with @@index
- @@map for explicit table naming
- Row-Level Security with ENABLE + FORCE + CREATE POLICY

### API Patterns
- APP_GUARD: ThrottlerGuard, JwtAuthGuard, RolesGuard
- APP_FILTER: GlobalExceptionFilter
- APP_INTERCEPTOR: ResponseTimeInterceptor
- @Public() decorator skips JWT check
- @Roles('ADMIN') restricts delete operations
- findFirst requires justification comment on preceding line

### Frontend
- Server components by default, 'use client' for interactive forms
- Server actions in lib/actions.ts for all API communication
- Token stored in httpOnly cookie, Authorization Bearer in fetch
- loading.tsx with role="status" + aria-busy="true"
- error.tsx with role="alert" + useRef focus management

### Shared Package
- Constants: BCRYPT_SALT_ROUNDS, ALLOWED_REGISTRATION_ROLES, MAX_PAGE_SIZE, etc.
- Utilities: createCorrelationId, clampPagination, paginationToSkipTake
- Validators: validateEnvVars (checks at startup)
- Sanitizers: sanitizeLogContext (recursive, handles arrays)

## Conventions

### DO
- Use Pino for structured JSON logging
- Include tenantId WHERE clause in every service query
- Add justification comment before every findFirst call
- Use @Public() on health, metrics, auth endpoints
- Use plain text VERIFY/TRACED tags (NOT markdown bold)
- Keep TRACED tags ONLY in .ts/.tsx files

### DO NOT
- Use `as any` — zero occurrences allowed
- Use `console.log` — use Pino logger instead
- Use `|| 'fallback'` — use ?? nullish coalescing
- Use `$executeRawUnsafe` — use parameterized $executeRaw or $queryRaw
- Use `**VERIFY**` — use plain text `VERIFY:` format
- Place TRACED tags in .prisma, .json, .yaml, or .css files

## Testing

### Unit Tests
- Co-located in src/{module}/*.spec.ts (NOT in test/ directory)
- Behavioral assertions with toHaveBeenCalledWith (not just mock-returns-mock)
- Coverage: json-summary reporter, branch >= 60%

### Integration Tests
- In apps/api/test/ directory
- Use supertest with full NestJS app bootstrap
- Cover auth, security, monitoring, cross-layer, performance

### Frontend Tests
- __tests__/accessibility.spec.tsx with jest-axe (import real components)
- __tests__/keyboard.spec.tsx with userEvent (import real components)
- NO inline test fixtures — always import from components/ui/

## Environment Variables

Required (validated at startup):
- DATABASE_URL
- JWT_SECRET
- JWT_REFRESH_SECRET
- CORS_ORIGIN
- PORT (default 3001)

## VERIFY/TRACED Tag System

- VERIFY tags in specs/*.md describe requirements
- TRACED tags in *.ts/*.tsx files mark implementations
- 100% bidirectional parity required — zero orphans
- Format: `VERIFY: AE-PREFIX-NNN — Description` / `TRACED: AE-PREFIX-NNN — Description`
