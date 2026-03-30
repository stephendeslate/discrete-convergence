# Event Management — CED v1.3-dc Project

## Architecture

Turborepo monorepo with pnpm workspaces:
- `apps/api` — NestJS 11 REST API with Prisma ORM, JWT auth, multi-tenant
- `apps/web` — Next.js 15 with React 19, Tailwind CSS 4, shadcn/ui-style components
- `packages/shared` — Cross-cutting utilities (constants, logging, validation, pagination)

## Quick Commands

```bash
pnpm install                          # Install all dependencies
pnpm turbo run build                  # Build all packages
pnpm turbo run test                   # Run all tests
pnpm turbo run lint                   # Lint all packages
pnpm turbo run typecheck              # Type check all packages
cd apps/api && npx prisma generate    # Generate Prisma client
cd apps/api && npx prisma migrate dev # Run migrations
cd apps/api && npx prisma db seed     # Seed database
```

## Key Decisions

### Authentication
- bcryptjs (NOT bcrypt) to avoid tar vulnerability chain
- JWT with passport-jwt strategy
- Global APP_GUARD pattern: ThrottlerGuard → JwtAuthGuard → RolesGuard
- @Public() decorator bypasses auth for specific endpoints
- ALLOWED_REGISTRATION_ROLES from shared package restricts self-registration

### Database
- Prisma >=6.0.0 <7.0.0 with PostgreSQL
- Row Level Security (RLS) policies on all tenant-scoped tables
- RLS uses TEXT comparison (no ::uuid cast) for tenant_id
- All models use @@map for snake_case table names, @map for snake_case columns
- Decimal type for monetary fields (Ticket.price)
- Composite indexes on (tenantId, status) for common query patterns

### Security
- Helmet with Content-Security-Policy
- CORS with configurable origin
- ValidationPipe: whitelist + forbidNonWhitelisted + transform
- Rate limiting via ThrottlerModule with named tiers (default, strict)
- Log sanitization: recursive redaction of SENSITIVE_KEYS
- No `console.log` in API source — structured logging only
- No `as any` casts anywhere in the codebase
- No `|| 'fallback'` patterns — use nullish coalescing (??) or defaults

### Monitoring
- Correlation ID on every request (X-Correlation-Id header)
- Response time measurement (X-Response-Time header)
- Structured JSON logging via formatLogEntry()
- Health check: GET /monitoring/health (returns version)
- Readiness check: GET /monitoring/readiness (SELECT 1 via $queryRaw)
- ALL monitoring endpoints are @Public() and do NOT require auth

### Frontend
- ESLint 9 flat config (eslint.config.mjs, NOT .eslintrc.json)
- Server actions for all API calls (no client-side fetch)
- Token stored via cookies().set() after login
- authenticatedFetch reads token from cookies, sends as Bearer header
- API_ROUTES constant uses single-quoted strings for FI scorer
- Loading states: role="status" + aria-busy="true" + Skeleton components
- Error states: role="alert" + useRef focus management + retry button
- Tests import real components — no inline fixture components

### Shared Package
- 8+ exports: APP_VERSION, BCRYPT_SALT_ROUNDS, MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE,
  ALLOWED_REGISTRATION_ROLES, SENSITIVE_KEYS, createCorrelationId, formatLogEntry,
  LogEntry, sanitizeLogContext, validateEnvVars, clampPageSize, calculateSkip
- Constants defined once, consumed by both API and web apps

## Traceability

VERIFY/TRACED bidirectional tags with EM- prefix.
- 86 total tags across 16 prefixes
- Specs in specs/ directory with VERIFY tags
- Source files have matching TRACED tags
- Zero orphans required

## Environment Variables

```
DATABASE_URL=postgresql://user:pass@localhost:5432/event_management?connection_limit=5
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000
PORT=3001
API_URL=http://localhost:3001
NODE_ENV=development
```

## Testing

- 10 test files in apps/api/test/
- 2 test files in apps/web/__tests__/
- 1 test file in packages/shared/__tests__/
- jest-axe for accessibility testing (with @types/jest-axe in tsconfig types)
- @testing-library/jest-dom type augmentation in web tsconfig
- No inline fixture components — tests import real components
- findFirst calls have justification comments on preceding lines

## Vulnerability Mitigations

- pnpm.overrides: `{ "effect": ">=3.20.0" }` for Prisma transitive dependency
- bcryptjs instead of bcrypt (avoids node-gyp/tar chain)
- `pnpm audit --audit-level=moderate` must pass in CI
