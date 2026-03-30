# Infrastructure Specification

## VERIFY:EM-INFRA-001 — Environment Validation
validateEnvVars() checks required env vars at startup. Exits with error if missing.

## VERIFY:EM-INFRA-002 — Database Seed
Seed script creates sample tenant, users (admin, organizer, viewer), venue, events
(published, cancelled, draft), tickets, attendees (checked-in, registered, no-show),
and audit logs. Uses BCRYPT_SALT_ROUNDS from shared.

## VERIFY:EM-INFRA-003 — Application Bootstrap
main.ts configures Helmet, CORS, ValidationPipe with whitelist/forbidNonWhitelisted/transform.

## VERIFY:EM-INFRA-004 — App Module
AppModule wires all domain modules with global guards (JWT, Roles, Throttler),
global exception filter, response time interceptor, and middleware (correlation ID, logging).

## Docker

- Multi-stage Dockerfile: build stage + production stage
- docker-compose.yml: api + postgres + web services
- docker-compose.test.yml: test configuration
- .dockerignore excludes node_modules, dist, .git

## CI/CD

- GitHub Actions workflow: lint, typecheck, test, build
- Runs on push to main and pull requests
- Uses pnpm for package management
