# FD-SPEC-005: Infrastructure

## Overview
Fleet Dispatch uses Docker for containerization, GitHub Actions for CI, and pnpm workspaces
for monorepo management.

## Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | PostgreSQL connection string |
| JWT_SECRET | Yes | Secret for JWT signing |
| CORS_ORIGIN | No | Allowed CORS origin (default: http://localhost:3000) |
| NODE_ENV | No | Runtime environment |

<!-- VERIFY:FD-INF-001 — env validation at startup requires DATABASE_URL, JWT_SECRET -->

## Docker
- Multi-stage Dockerfile (build + runtime)
- docker-compose.yml for local development (api + postgres + web)
- docker-compose.test.yml for CI test environment

## Database
- PostgreSQL via Prisma ORM
- Migrations in prisma/migrations/
- Seed script for development data

<!-- VERIFY:FD-INF-002 — seed script creates tenant, users, vehicles, drivers, routes, deliveries -->

## Monorepo Structure
```
fleet-dispatch/
  apps/api/       — NestJS API
  apps/web/       — Next.js frontend
  packages/shared — Shared types, utilities, constants
```

## CI/CD
- GitHub Actions workflow: lint, typecheck, test
- Runs on push to main and pull requests

<!-- VERIFY:FD-INF-003 — root app module wires all domain modules -->
<!-- VERIFY:FD-INF-004 — bootstrap with helmet, CORS, validation pipes -->
