# Event Management Platform — Project Instructions

## Architecture

Turborepo monorepo with pnpm workspaces:
- `apps/api` — NestJS 11 REST API with Prisma ORM, JWT auth, RBAC
- `apps/web` — Next.js 15 frontend with App Router, Tailwind CSS, shadcn/ui
- `packages/shared` — Shared TypeScript utilities (constants, logging, pagination)

## Critical Build Rules

1. **Shared package must compile to dist/** — `packages/shared/tsconfig.json` has `outDir: "dist"`.
   The `package.json` points `main` to `dist/index.js`. If shared doesn't build first, API and web fail.

2. **Turbo build ordering** — turbo.json specifies `"dependsOn": ["^build"]` so shared builds before apps.

3. **API tsconfig.build.json** — Uses `rootDir: "src"` and `outDir: "dist"` with `noEmit: false`.
   The regular `tsconfig.json` has `noEmit: true` (for IDE/tests only).

4. **Prisma generate before build** — Run `npx prisma generate` before `tsc` in the API.

## Domain Model

Five entities: User, Event, Venue, Attendee, Registration.
All scoped by tenantId for multi-tenant isolation.
RLS policies on all tables for defense-in-depth.

## Authentication

- JWT with bcryptjs (not bcrypt — avoids native compilation issues)
- Roles: ADMIN, EDITOR, VIEWER
- Self-registration restricted to VIEWER role
- Tokens stored in httpOnly cookies on the frontend

## Key Patterns

- @Public() decorator skips JWT guard
- @Roles() decorator + RolesGuard for RBAC
- ThrottlerModule: 100/sec short, 500/10sec medium, 2000/min long
- Auth endpoints: @Throttle 10/sec
- Health endpoints: @Public() but NOT @SkipThrottle()
- GlobalExceptionFilter includes correlationId in error responses
- ResponseTimeInterceptor sets X-Response-Time header
- CorrelationIdMiddleware preserves/generates X-Correlation-ID

## Testing

### API Tests
- 20+ co-located unit tests in `src/` (`.spec.ts` files next to source)
- 6 integration tests in `test/` (auth, event, monitoring, security, performance, cross-layer)
- Jest with json-summary coverage reporter
- Mocked PrismaService — no real DB needed for unit/integration tests

### Web Tests
- `__tests__/accessibility.spec.tsx` — ARIA role verification
- `__tests__/keyboard.spec.tsx` — Focus and keyboard interaction

### Running Tests
```bash
pnpm turbo run test        # All tests
cd apps/api && pnpm test   # API only
cd apps/web && pnpm test   # Web only
```

## VERIFY/TRACED Tags

Bidirectional traceability between specs and source:
- Spec files contain `VERIFY: EM-{DOMAIN}-{NNN} — Description`
- Source files contain `TRACED: EM-{DOMAIN}-{NNN} — Description`
- Every VERIFY must have a matching TRACED (and vice versa)
- Zero orphans required

Tag domains: AUTH, SEC, DATA, EVENT, VENUE, ATTEND, REG, MON, PERF, INFRA, CROSS, FE, EDGE

## Environment Variables

Required (validated at startup):
- DATABASE_URL — PostgreSQL connection string
- JWT_SECRET — Access token signing key
- JWT_REFRESH_SECRET — Refresh token signing key
- PORT — API port (default 3001)
- CORS_ORIGIN — Allowed CORS origin

## Common Commands

```bash
pnpm install                           # Install all dependencies
cd apps/api && npx prisma generate     # Generate Prisma client
pnpm turbo run build                   # Build all packages
pnpm turbo run test                    # Run all tests
pnpm turbo run lint                    # Lint all packages
```

## Failure Mode Awareness

- FM-34: Health controller at @Controller('health'), not @Controller('monitoring')
- FM-40/48: No @SkipThrottle() on health endpoints
- FM-49: Pino for structured logging, @Throttle on auth
- FM-T8-003: RLS uses TEXT comparison, no ::uuid cast
- FM-T8-005: bcryptjs, not bcrypt
- FM-T11-002: ESLint 9 flat config (eslint.config.mjs)
