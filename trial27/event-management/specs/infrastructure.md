# Infrastructure Specification

## Overview
Docker, CI/CD, environment configuration, and monorepo setup.

### VERIFY: EM-INFRA-001 — Shared package exports constants and utilities
`packages/shared/src/index.ts` exports APP_VERSION, BCRYPT_SALT_ROUNDS, MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE, JWT_EXPIRY, CORRELATION_HEADER, HEALTH_CHECK_TIMEOUT, RATE_LIMIT_TTL, RATE_LIMIT_MAX, and utility functions.
These constants ensure consistency across the API and web applications.
The shared package is referenced by both `apps/api` and `apps/web` via pnpm workspace protocol.
Utility functions include `sanitizeLogValue()` for log redaction and `validateEnvVars()` for startup checks.

### VERIFY: EM-INFRA-002 — main.ts bootstraps with validation, helmet, CORS, and shutdown hooks
Application bootstrap includes validateEnvVars, helmet with CSP, CORS, ValidationPipe, and enableShutdownHooks.
The bootstrap sequence is: validate env vars → create app → configure middleware → start listening.
Helmet is configured with Content Security Policy directives (see [security.md](security.md) for CSP details).
The ValidationPipe is set globally with whitelist, forbidNonWhitelisted, and transform options.

### VERIFY: EM-INFRA-003 — validateEnvVars checks DATABASE_URL and JWT_SECRET
At startup, the application validates that DATABASE_URL and JWT_SECRET environment variables are set.
If either variable is missing, the process exits with a clear error message and exit code 1.
This prevents the application from starting in a misconfigured state.
Additional variables like PORT are optional and fall back to defaults.

### VERIFY: EM-INFRA-004 — Test helpers provide createTestApp and getAuthToken
Integration test helpers in `test/helpers/test-app.ts` create a test NestJS application and obtain auth tokens.
`createTestApp()` compiles the full AppModule with test overrides for the database connection.
`getAuthToken()` registers a test user and returns a valid JWT for authenticated test requests.
These helpers ensure consistent test setup across all integration test suites.

### VERIFY: EM-INFRA-005 — ESLint 9 flat config in eslint.config.mjs
ESLint uses flat config format with @typescript-eslint/no-explicit-any set to error.
The config extends recommended TypeScript rules and includes Prettier integration.
Custom rules enforce consistent code style across the monorepo.
The config is shared across all packages via the workspace root eslint.config.mjs.
Flat config format replaces the legacy .eslintrc files used in ESLint 8 and earlier.

### VERIFY: EM-INFRA-006 — Docker compose with api and db services
`docker-compose.yml` defines `api` service (NestJS app) and `db` service (PostgreSQL 16).
The `api` service depends on `db` with a health check condition to ensure the database is ready before starting.
Environment variables are loaded from `.env` file with defaults for local development.
The API endpoints documented in [api-endpoints.md](api-endpoints.md) are deployed behind the Docker network.

### VERIFY: EM-INFRA-007 — Multi-stage Dockerfile with HEALTHCHECK
Dockerfile has install, build, and production stages. Uses Node 20 Alpine. Includes HEALTHCHECK and LABEL directives.
Stage 1 (install): Copies package.json files and runs `pnpm install --frozen-lockfile`.
Stage 2 (build): Copies source, generates Prisma client, and runs `pnpm build`.
Stage 3 (production): Copies only production artifacts, sets NODE_ENV=production.
HEALTHCHECK uses `wget --spider http://localhost:3001/health` with 30s interval and 3 retries.

### VERIFY: EM-INFRA-008 — CI pipeline with install, lint, typecheck, test, build, docker build
GitHub Actions workflow runs all quality checks and builds Docker image.
Steps: checkout → setup Node → install pnpm → install deps → lint → typecheck → run migrations → test → build → docker build.
The pipeline runs on push to main and on pull requests targeting main.
Test step requires a PostgreSQL service container for integration tests.
The Docker build step verifies the production image builds without errors.
