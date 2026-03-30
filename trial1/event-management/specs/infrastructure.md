# Infrastructure Specification

> **Project:** Event Management
> **Category:** INFRA
> **Cross-references:** See [data-model.md](data-model.md), [monitoring.md](monitoring.md)

---

## Requirements

### VERIFY:EM-INFRA-001 — Multi-stage Dockerfile

Multi-stage Docker build with three stages:
- **deps**: `node:20-alpine`, enables corepack for pnpm@9, copies workspace config files
  (turbo.json, pnpm-workspace.yaml, pnpm-lock.yaml, root package.json) and all app
  package.json files, runs `pnpm install --frozen-lockfile`
- **build**: copies full source, runs `pnpm turbo run build`
- **production**: `node:20-alpine`, `USER node`, `COPY --from=build --chown=node:node`,
  `EXPOSE 3001`, `HEALTHCHECK CMD wget -q --spider http://localhost:3001/health || exit 1`,
  `LABEL maintainer="event-management"`, `CMD ["node", "apps/api/dist/main.js"]`

### VERIFY:EM-INFRA-002 — CI/CD Pipeline

GitHub Actions workflow with PostgreSQL 16 service container. Environment variables
configured for test database connection. Jobs executed via `pnpm turbo run`:
- `lint` — ESLint across all packages
- `typecheck` — TypeScript compilation check
- `build` — full monorepo build
- `test` — unit and integration tests
- `audit` — `pnpm audit --audit-level=high` for dependency vulnerabilities

Workflow triggers on push to main and pull requests to main.

### VERIFY:EM-INFRA-003 — Docker Compose

`docker-compose.yml` with:
- PostgreSQL 16 service with `pg_isready` healthcheck, named volume for data persistence
- API service depending on db with `service_healthy` condition
- Environment variables for database connection, JWT secrets, CORS

`docker-compose.test.yml` with:
- PostgreSQL in tmpfs for fast ephemeral test databases
- Test runner service with test-specific environment variables

`.env.example` documents all required environment variables with safe placeholder values.

### VERIFY:EM-INFRA-004 — Environment Validation

`validateEnvVars()` from shared package called at application bootstrap in `main.ts`.
Validates presence of: DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, CORS_ORIGIN.
Missing variables cause `process.exit(1)` with descriptive error message. No hardcoded
fallbacks for any environment variable — all values must be explicitly configured.
See [monitoring.md](monitoring.md) for health endpoint that reports application status.

---

## Verification Checklist

- [ ] Dockerfile has three stages: deps, build, production
- [ ] Production stage uses `USER node` and `HEALTHCHECK`
- [ ] CI workflow runs lint, typecheck, build, test, audit
- [ ] docker-compose.yml has PostgreSQL with healthcheck and named volume
- [ ] .env.example documents all required variables
- [ ] Seed script imports BCRYPT_SALT_ROUNDS from shared
- [ ] Seed script has console.error + process.exit(1) error handling
