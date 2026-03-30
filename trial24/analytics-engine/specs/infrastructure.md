# Infrastructure Specification

## Overview

The Analytics Engine is deployed as a monorepo using Turborepo with pnpm
workspaces. It comprises three packages: `apps/api` (NestJS), `apps/web`
(Next.js), and `packages/shared` (common utilities).

## Database Layer

The API uses PostgreSQL 16 with Prisma 6 as the ORM. Row-Level Security
policies enforce tenant isolation at the database level. Migrations are
managed via Prisma Migrate.

## Docker Configuration

Docker Compose files define the development and test environments:
- `docker-compose.yml` — Development setup with PostgreSQL and API
- `docker-compose.test.yml` — Test setup with ephemeral database

## CI Pipeline

GitHub Actions CI runs on every push and pull request:
- Install dependencies (pnpm)
- Generate Prisma client
- Run linting (ESLint 9 flat config)
- Run type checking (TypeScript strict mode)
- Run unit and integration tests
- Build all packages

## Package Structure

| Package | Framework | Purpose |
|---------|-----------|---------|
| apps/api | NestJS 11 | REST API with JWT auth, Prisma ORM |
| apps/web | Next.js 15 | Frontend with React 19, Tailwind CSS |
| packages/shared | TypeScript | Shared types, constants, utilities |

## Environment Configuration

Required environment variables:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — Secret for signing JWT tokens
- `BCRYPT_SALT_ROUNDS` — Salt rounds for password hashing (default: 12)
- `PORT` — HTTP server port (default: 3001)

## Build and Development

- `pnpm install` — Install all dependencies
- `pnpm build` — Build all packages via Turborepo
- `pnpm dev` — Start development servers
- `pnpm test` — Run all test suites
- `pnpm lint` — Lint all packages

## Cross-References

- Database schema: see [data-model.md](data-model.md)
- API modules: see [monitoring.md](monitoring.md)
- Security configuration: see [security.md](security.md)
- Auth configuration: see [authentication.md](authentication.md)
