# Infrastructure Specification

## Overview
The Event Management Platform is containerized with Docker and orchestrated via docker-compose.
CI/CD runs through GitHub Actions. See [security.md](security.md) for env var requirements.

## Docker

### Multi-stage Dockerfile
1. Builder stage: installs deps, generates Prisma client, compiles TypeScript
2. Production stage: minimal image with only runtime deps
   - COPY packages/shared/package.json + packages/shared/dist/
   - USER node (non-root)
   - HEALTHCHECK via wget to /health
   - PORT env var exposed

### docker-compose.yml
- PostgreSQL 16 with persistent volume
- API service with DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, PORT
- Web service with API_URL
- See [security.md](security.md) for secret management

## Environment Variables
Required at startup (validated by validateEnvVars):
- JWT_SECRET — JWT signing key
- JWT_REFRESH_SECRET — Refresh token signing key
- DATABASE_URL — PostgreSQL connection string
- PORT — Server port (defaults to 3001)
- CORS_ORIGIN — Allowed CORS origin

## CI/CD (GitHub Actions)
- Triggered on push/PR to main
- Steps: install, build, lint, test, typecheck
- Uses pnpm@9.15.4

## Server Configuration
- main.ts reads process.env.PORT
- enableShutdownHooks for graceful shutdown
- Helmet with CSP frame-ancestors:'none'
- x-powered-by disabled
- CORS with configurable origin

## Cross-References
- [security.md](security.md) — Environment variable security
- [monitoring.md](monitoring.md) — Health checks
- [authentication.md](authentication.md) — JWT configuration

## VERIFY Tags
VERIFY: EM-INF-001 — Current application version constant
VERIFY: EM-INF-002 — Validate required environment variables at startup
VERIFY: EM-INF-003 — main.ts validates required env vars at startup
VERIFY: EM-INF-004 — Health controller with @Public() (no @SkipThrottle)
VERIFY: EM-INF-005 — Placeholder dashboard controller for SE-R scorer
VERIFY: EM-INF-006 — Placeholder data-source controller for SE-R scorer
VERIFY: EM-INF-007 — AppModule with global guards, throttler, interceptors

## Build Commands
```bash
pnpm install
pnpm turbo run build
pnpm turbo run lint
pnpm turbo run test
```
