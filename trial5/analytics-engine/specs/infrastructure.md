# Infrastructure Specification

## Overview

The Analytics Engine is containerized with Docker and orchestrated via Docker Compose.
CI/CD runs on GitHub Actions.

<!-- VERIFY: AE-INFRA-001 -->

## Docker

### Dockerfile
- Multi-stage build: build stage on node:20-alpine, runtime on node:20-alpine
- Copies only production artifacts to runtime stage
- Runs as non-root user

### docker-compose.yml
Services:
- **api**: NestJS backend on port 4000
- **web**: Next.js frontend on port 3000
- **postgres**: PostgreSQL 16 on port 5432
- **redis**: Redis 7 on port 6379

### docker-compose.test.yml
- Test-specific PostgreSQL instance on port 5433
- Used for integration tests in CI

## Environment Variables

Required:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT signing

Optional:
- `PORT`: API port (default 4000)
- `CORS_ORIGIN`: Allowed CORS origin (default http://localhost:3000)
- `REDIS_URL`: Redis connection string
- `NODE_ENV`: Environment (development/production/test)

## CI/CD (GitHub Actions)

### ci.yml
Jobs:
1. **lint**: Run linter across all packages
2. **typecheck**: TypeScript type checking
3. **test**: Run test suites with test PostgreSQL
4. **build**: Build all packages and apps

Triggers: push to main, pull requests to main
