# Infrastructure Specification

## Overview
Docker multi-stage builds, CI/CD, environment validation, and deployment configuration.

### VERIFY: FD-INF-001 — Shared constants exported from packages/shared
APP_VERSION, BCRYPT_SALT_ROUNDS (12), MAX_PAGE_SIZE (100), DEFAULT_PAGE_SIZE (10), JWT_EXPIRY ('24h'), CORRELATION_HEADER, HEALTH_CHECK_TIMEOUT, RATE_LIMIT_TTL, RATE_LIMIT_MAX.
These constants ensure consistency across the API and web applications.
The shared package is referenced via pnpm workspace protocol (`workspace:*`).
Utility functions include `sanitizeLogValue()` for log redaction and `validateEnvVars()` for startup validation.

### VERIFY: FD-INF-002 — Application bootstrap with Helmet, CORS, ValidationPipe, shutdown hooks
main.ts calls validateEnvVars, configures Helmet with CSP, enables CORS, sets global ValidationPipe (whitelist + forbidNonWhitelisted + transform), and enables shutdown hooks.
The bootstrap sequence ensures environment validation happens before any app initialization.
Helmet configuration uses Content Security Policy directives as documented in [security.md](security.md).
The ValidationPipe protects all endpoints from malformed input.
Shutdown hooks ensure graceful termination of database connections and in-flight requests.

### VERIFY: FD-INF-003 — ESLint 9 flat config in eslint.config.mjs
Uses @typescript-eslint with flat config format. no-explicit-any set to error.
The configuration extends the recommended TypeScript-ESLint rule set.
Flat config format (eslint.config.mjs) is the ESLint 9 default, replacing .eslintrc files.
Custom rules enforce consistent code quality across all packages in the monorepo.

### VERIFY: FD-INF-004 — Test infrastructure with createTestApp and getAuthToken
test/helpers/test-app.ts exports createTestApp() and getAuthToken() for integration tests.
`createTestApp()` compiles the full AppModule with any necessary test overrides.
`getAuthToken()` registers a test user, logs in, and returns a valid JWT for authenticated requests.
These helpers standardize test setup and reduce boilerplate across integration test files.
The test database is configured via docker-compose.test.yml on a separate port (5433).

### VERIFY: FD-INF-005 — app.enableShutdownHooks() in main.ts
Ensures graceful shutdown of the NestJS application and Prisma connections.
When the process receives SIGTERM or SIGINT, NestJS triggers the onModuleDestroy lifecycle hooks.
Prisma's $disconnect() is called during shutdown to cleanly close database connection pools.
This prevents connection leaks during container restarts and rolling deployments.

### VERIFY: FD-INF-006 — validateEnvVars at startup
validateEnvVars(['DATABASE_URL', 'JWT_SECRET']) is called before app creation in main.ts.
If any required variable is missing, the function throws an error with a descriptive message listing missing variables.
This fail-fast behavior prevents the application from starting in a misconfigured state.
Additional optional variables (PORT, NODE_ENV) have sensible defaults.

### VERIFY: FD-INF-007 — Multi-stage Dockerfile with HEALTHCHECK
Three stages: install (dependencies), build (compile), production (runtime). Node 20 Alpine base. HEALTHCHECK pings /health. LABEL for OCI metadata.
Stage 1 copies package.json files and runs `pnpm install --frozen-lockfile` for reproducible installs.
Stage 2 copies source, generates Prisma client, and compiles TypeScript.
Stage 3 copies only production artifacts and sets NODE_ENV=production.
HEALTHCHECK: `wget --spider http://localhost:3001/health` with 30s interval and 3 retries.
The API endpoints documented in [api-endpoints.md](api-endpoints.md) are served from this container.

### VERIFY: FD-INF-008 — Docker Compose with api and db services
docker-compose.yml defines api (the NestJS app) and db (PostgreSQL 16) services. api depends on db health.
The db service uses PostgreSQL 16 Alpine image with a named volume for data persistence.
The api service maps port 3001 and loads environment variables from .env file.
Health check on db ensures the API only starts after PostgreSQL is accepting connections.

### VERIFY: FD-INF-009 — Test Docker Compose with test-db
docker-compose.test.yml provides isolated test-db service on port 5433.
This ensures integration tests run against a separate database from development.
The test database is ephemeral — it can be recreated between test runs without affecting development data.

### VERIFY: FD-INF-010 — CI pipeline with GitHub Actions
ci.yml: install → lint → typecheck → migrate → test → build → docker build.
The pipeline runs on push to main and on pull requests targeting main.
Test step uses a PostgreSQL service container for integration test database access.
Docker build step validates that the production image builds successfully.
