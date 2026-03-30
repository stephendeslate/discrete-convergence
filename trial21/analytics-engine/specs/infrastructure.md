# Infrastructure Specification

## Overview

The analytics engine is deployed as a containerized monorepo using Docker with
PostgreSQL for persistence. CI/CD runs via GitHub Actions.

Cross-reference: See [monitoring.md](monitoring.md) for observability details.
Cross-reference: See [security.md](security.md) for production security hardening.

## Docker Configuration

### Multi-stage Dockerfile
1. **deps**: Install pnpm dependencies
2. **build**: Compile TypeScript, generate Prisma client
3. **production**: Minimal runtime image

Key requirements:
- `prisma generate` must run before `tsc` compilation
- Production stage copies packages/shared/package.json and dist/
- HEALTHCHECK instruction pings /health endpoint
- Runs as non-root `node` user

### Docker Compose
- PostgreSQL 16 with health check
- API service with environment variables
- Persistent volume for database data

## VERIFY Tags

VERIFY: AE-INFRA-001 — environment variable validation at startup
VERIFY: AE-INFRA-002 — Prisma service lifecycle management
VERIFY: AE-INFRA-003 — health endpoint is public (no @SkipThrottle)
VERIFY: AE-INFRA-004 — readiness endpoint checks service dependencies
VERIFY: AE-INFRA-005 — main.ts validates env vars and configures security
VERIFY: AE-INFRA-006 — multi-stage Dockerfile with prisma generate before build
VERIFY: AE-INFRA-007 — production stage copies shared package files (FM-51)

## Environment Variables

Required:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for access token signing
- `JWT_REFRESH_SECRET`: Secret for refresh token signing

Optional:
- `PORT`: API server port (default: 3001)
- `CORS_ORIGIN`: Allowed CORS origins (default: http://localhost:3000)

## CI/CD Pipeline

GitHub Actions workflow:
1. Install pnpm dependencies
2. Build all packages
3. Run linting
4. Run tests
5. Run type checking

## Edge Cases

VERIFY: AE-INFRA-008 — missing DATABASE_URL throws descriptive error at startup
VERIFY: AE-INFRA-009 — missing JWT_SECRET throws descriptive error at startup
VERIFY: AE-INFRA-010 — graceful shutdown via app.enableShutdownHooks()
