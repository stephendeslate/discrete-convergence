# Analytics Engine — CLAUDE.md

## Project Overview

Real-time analytics dashboard platform with multi-tenant RBAC. Built with NestJS 11 (backend),
Next.js 15 App Router (frontend), Prisma ORM with PostgreSQL 16, and a shared utilities package.
Monorepo managed by Turborepo + pnpm workspaces.

## Architecture

```
analytics-engine/
├── apps/
│   ├── api/          # NestJS 11 backend (port 3001)
│   └── web/          # Next.js 15 frontend (port 3000)
├── packages/
│   └── shared/       # @analytics-engine/shared — constants, utilities
├── specs/            # CED specification files with VERIFY tags
├── turbo.json        # Turborepo task config
└── pnpm-workspace.yaml
```

## Key Commands

```bash
pnpm install                    # Install all dependencies
pnpm turbo run build            # Build all packages
pnpm turbo run test             # Run all tests
pnpm turbo run lint             # Lint all packages
pnpm turbo run typecheck        # Type-check all packages
pnpm turbo run test --filter=@analytics-engine/api   # Test API only
pnpm turbo run test --filter=@analytics-engine/web   # Test web only
pnpm turbo run test --filter=@analytics-engine/shared # Test shared only
```

## Domain Entities

- **Tenant** — multi-tenant root; all data scoped by tenantId
- **User** — roles: ADMIN, USER, ANALYST; belongs to Tenant
- **Dashboard** — status: DRAFT, PUBLISHED, ARCHIVED; soft-delete via archive
- **Widget** — type: CHART, TABLE, METRIC, MAP; belongs to Dashboard; hard delete
- **DataSource** — type: POSTGRES, API, CSV; status: ACTIVE, INACTIVE, ERROR; hard delete

## Authentication Flow

1. `POST /auth/register` — bcrypt hash with BCRYPT_SALT_ROUNDS from shared
2. `POST /auth/login` — returns `{ access_token, refresh_token }`
3. `POST /auth/refresh` — validates refresh token, returns new token pair
4. JWT strategy reads `secretOrKey` from `JWT_SECRET` env var
5. Frontend stores token via httpOnly cookie in server action

## Global Provider Chain (execution order)

1. **Middleware**: CorrelationIdMiddleware, RequestLoggingMiddleware
2. **Guards**: ThrottlerGuard → JwtAuthGuard → RolesGuard
3. **Interceptors**: ResponseTimeInterceptor
4. **Filters**: GlobalExceptionFilter

## Shared Package Exports (10 symbols)

- `BCRYPT_SALT_ROUNDS`, `ALLOWED_REGISTRATION_ROLES`, `APP_VERSION`
- `MAX_PAGE_SIZE`, `DEFAULT_PAGE_SIZE`, `clampPagination`
- `createCorrelationId`, `formatLogEntry`, `sanitizeLogContext`, `validateEnvVars`

## Environment Variables

| Variable | Required | Default |
|----------|----------|---------|
| DATABASE_URL | Yes | — |
| JWT_SECRET | Yes | — |
| JWT_REFRESH_SECRET | Yes | — |
| CORS_ORIGIN | Yes | — |
| NODE_ENV | No | development |
| PORT | No | 3001 |
| API_URL | No | — |

All required vars validated at startup; missing causes `process.exit(1)`.

## Testing Strategy

- **Unit tests**: Service-level with mocked Prisma (test/*.service.spec.ts)
- **Integration tests**: Supertest against compiled NestJS app (test/*.integration.spec.ts)
- **Frontend tests**: Accessibility (jest-axe) and keyboard interaction (@testing-library)
- **Shared tests**: Utility function coverage (packages/shared/__tests__/)
- Assertion density: >=2 assertions per `it()` block
- Behavioral assertions: `toHaveBeenCalledWith` over `toHaveBeenCalled`

## VERIFY/TRACED Tag System

- Specs contain `VERIFY:AE-*` tags defining requirements
- Source `.ts`/`.tsx` files contain matching `TRACED:AE-*` tags
- 40 unique tags across 8 spec categories
- Zero orphan tolerance target (<=2 allowed)
- Tags must ONLY appear in TypeScript source files, never config/schema/CSS

## Security Layers

- Helmet CSP with restrictive directives (no unsafe-eval)
- CORS from `CORS_ORIGIN` environment variable (no fallback)
- ThrottlerModule: `default` 100/60s, `auth` 5/60s
- ValidationPipe: whitelist + forbidNonWhitelisted + transform
- Row Level Security in PostgreSQL with ENABLE + FORCE + CREATE POLICY

## Gotchas

- `auth.service.login()` takes `(email: string, password: string)` — NOT a DTO object
- `jwtService.sign()` is synchronous — not `signAsync`
- No SyncRun model in this trial's schema (unlike trial1)
- Dashboard delete is soft (status → ARCHIVED), Widget/DataSource deletes are hard
- Dark mode is CSS `@media (prefers-color-scheme: dark)` — NO `.dark` class toggling
- `@Roles('ADMIN')` on DataSource delete, `@Roles('ADMIN', 'ANALYST')` on Dashboard delete
