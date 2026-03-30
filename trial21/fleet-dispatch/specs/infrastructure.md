# Infrastructure Specification

## Overview
Fleet Dispatch runs as containerized services with Docker Compose.
Multi-stage Dockerfile for optimized production builds.

## Docker Configuration
- Multi-stage Dockerfile: build → production
- prisma generate before tsc in build stage
- Production stage copies shared package files — VERIFY: FD-INFRA-001
- HEALTHCHECK /health endpoint
- USER node (non-root)
- PORT environment variable

## Environment Variables
Required:
- DATABASE_URL: PostgreSQL connection string
- JWT_SECRET: Access token signing key
- JWT_REFRESH_SECRET: Refresh token signing key
- PORT: Application port (default 3000)
- NODE_ENV: Environment (development/production)

## Docker Compose
- api: NestJS API service
- db: PostgreSQL 16
- web: Next.js frontend
- PORT env var for service configuration

## CI/CD
- GitHub Actions workflow for build/test/lint
- Runs on push to main and pull requests
- pnpm install → build → lint → test

## Health Checks
- GET /health — Liveness probe — VERIFY: FD-INFRA-003
- GET /health/ready — Readiness probe (DB connectivity) — VERIFY: FD-INFRA-002
- @Public() decorator (no auth required)
- Container HEALTHCHECK uses /health endpoint

## Application Startup
- validateEnvVars(['JWT_SECRET', 'JWT_REFRESH_SECRET'])
- enableShutdownHooks for graceful termination
- process.env.PORT for configurable port
- Helmet, CORS, ValidationPipe initialized

## Monitoring
- ResponseTimeInterceptor as APP_INTERCEPTOR — VERIFY: FD-MON-003
- CorrelationIdMiddleware for request tracing — VERIFY: FD-MON-004
- Pino structured logging — VERIFY: FD-MON-002
- Metrics endpoint for observability — VERIFY: FD-MON-005

## Build Configuration
- tsconfig.build.json: rootDir:"src", flat dist output
- Monorepo: pnpm workspaces + Turborepo
- Shared package built before API and web

## Cross-References
- See [security.md](security.md) for security configuration
- See [monitoring.md](monitoring.md) for observability details
- See [api-endpoints.md](api-endpoints.md) for health endpoints
