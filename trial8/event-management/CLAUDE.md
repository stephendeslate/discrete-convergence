# Event Management Platform

## Overview

Full-stack event management platform built as part of the discrete-convergence experiment (Trial 8).
The system provides multi-tenant event creation, ticketing, attendee management, scheduling, and
monitoring capabilities with a NestJS API backend and Next.js frontend.

## Tech Stack

| Layer       | Technology                                      |
|-------------|------------------------------------------------|
| API         | NestJS 11, Passport JWT, class-validator        |
| ORM         | Prisma >=6.0.0 <7.0.0                          |
| Database    | PostgreSQL 16+                                  |
| Frontend    | Next.js 15, React 19, Tailwind CSS 4            |
| UI Utils    | clsx + tailwind-merge (cn() helper)             |
| Build       | Turborepo, pnpm 9.x                             |
| Testing     | Jest 29, Supertest, Testing Library, jest-axe    |

## Architecture Decisions

- **Monorepo with Turborepo** — apps/api, apps/web, packages/shared workspaces
- **Multi-tenant by design** — tenantId required on all user registrations
- **JWT auth with httpOnly cookies** — API issues tokens, web stores in secure cookies via server actions
- **Public decorator pattern** — endpoints are auth-guarded by default; `@Public()` opts out
- **Pagination clamping** — invalid page/pageSize values are clamped (not rejected) for robustness
- **Correlation IDs** — every request gets a unique ID via middleware, echoed in response headers
- **Response time tracking** — `X-Response-Time` header added by global interceptor
- **Structured logging** — pino-based with sensitive field redaction (password, token, secret)
- **Global exception filter** — catches unhandled errors, returns consistent JSON responses
- **Helmet + Throttler** — security headers and rate limiting enabled globally

## Shared Package Exports (`packages/shared`)

### Constants
- `BCRYPT_SALT_ROUNDS` — 12 rounds for password hashing
- `ALLOWED_REGISTRATION_ROLES` — `['USER', 'ORGANIZER']` (ADMIN excluded from self-registration)
- `MAX_PAGE_SIZE` — 100 (upper bound for pagination)
- `DEFAULT_PAGE_SIZE` — 20
- `APP_VERSION` — current app version string

### Functions
- `createCorrelationId()` — generates a UUID v4 for request tracing
- `formatLogEntry(data)` — creates structured log objects with timestamp
- `sanitizeLogContext(obj)` — deep-redacts sensitive keys (password, token, secret, etc.)
- `validateEnvVars(required)` — throws if any listed env vars are missing
- `clampPagination(page?, pageSize?)` — returns `{ page, pageSize, skip }` with clamped values

## Dev Commands

```bash
# Install dependencies
pnpm install

# Run all apps in dev mode
pnpm dev

# Run all tests (via Turborepo)
pnpm test

# Run API tests only
cd apps/api && pnpm test

# Run web tests only
cd apps/web && pnpm test

# Lint all packages
pnpm lint

# Type-check all packages
pnpm typecheck

# Format code
pnpm format

# Prisma commands (from apps/api)
pnpm prisma:generate
pnpm prisma:migrate
pnpm seed

# Docker (full stack)
docker compose up -d
docker compose -f docker-compose.test.yml up --abort-on-container-exit
```

## Environment Variables

| Variable              | Description                       | Default/Example                          |
|-----------------------|-----------------------------------|------------------------------------------|
| `DATABASE_URL`        | PostgreSQL connection string      | `postgresql://postgres:postgres@localhost:5432/event_management` |
| `POSTGRES_USER`       | DB user (Docker)                  | `postgres`                               |
| `POSTGRES_PASSWORD`   | DB password (Docker)              | `postgres`                               |
| `POSTGRES_DB`         | DB name (Docker)                  | `event_management`                       |
| `JWT_SECRET`          | Secret for JWT signing            | (change in production)                   |
| `JWT_EXPIRES_IN`      | Token expiration                  | `1h`                                     |
| `BCRYPT_SALT_ROUNDS`  | Password hash rounds              | `12`                                     |
| `CORS_ORIGIN`         | Allowed CORS origin               | `http://localhost:3000`                  |
| `NODE_ENV`            | Runtime environment               | `development`                            |
| `PORT`                | API server port                   | `3001`                                   |
| `APP_VERSION`         | Application version               | `1.0.0`                                  |

## Testing Strategy

- **Integration tests** — Supertest against real NestJS app with test database
- **Security tests** — auth bypass attempts, role enforcement, input validation
- **Monitoring tests** — health endpoints, correlation IDs, response time headers
- **Performance tests** — response time format validation, pagination clamping
- **Frontend tests** — accessibility (jest-axe), keyboard navigation (user-event)
- **TRACED tags** — every test has a `// TRACED: EM-XXX-NNN` comment for traceability
- **Assertion density** — minimum 1.5 assertions per test (multiple expects per it block)

## Security Decisions

- ADMIN role cannot be self-registered (enforced in shared constants + API validation)
- Passwords hashed with bcrypt (12 rounds)
- JWT stored in httpOnly, secure, sameSite=lax cookies
- Helmet middleware for security headers (CSP, HSTS, etc.)
- Rate limiting via @nestjs/throttler
- Input validation via class-validator with whitelist + forbidNonWhitelisted
- Log sanitization strips sensitive fields before output
- CORS restricted to configured origin
