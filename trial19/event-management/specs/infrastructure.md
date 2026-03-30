# Infrastructure Specification

## Overview

Deployment and infrastructure configuration for the Event Management platform.
Covers environment validation, containerization, and CI/CD pipeline.

## Environment Validation

- Required environment variables validated at startup
- DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET must be present and non-empty
- Missing variables cause immediate process exit with descriptive error
- VERIFY: EM-INFRA-001 — validateEnvVars throws on missing or empty required variables

## Application Bootstrap

- x-powered-by disabled before any middleware registration
- Helmet middleware with CSP frame-ancestors:'none'
- CORS enabled with configurable origin (CORS_ORIGIN env var)
- Global ValidationPipe with whitelist, forbidNonWhitelisted, transform
- Shutdown hooks enabled for graceful termination
- Port configurable via PORT env var, defaults to 3001
- VERIFY: EM-INFRA-002 — main.ts disables x-powered-by and configures Helmet/CORS/ValidationPipe

## Docker Configuration

- Multi-stage build: deps, build, production
- Base image: node:20-alpine
- Prisma generate runs before TypeScript compilation
- Production stage copies only dist, node_modules, prisma
- Runs as non-root user (node)
- HEALTHCHECK configured against /health endpoint

## Docker Compose

- Services: api, postgres
- PostgreSQL 16 with named volume for data persistence
- Health check on postgres before api starts
- Environment variables from .env file
- Port mapping configurable

## CI/CD Pipeline

- GitHub Actions workflow
- Steps: checkout, setup Node 20, pnpm install, lint, test, build, typecheck
- Runs on push to main and pull requests
- Caches pnpm store for faster builds

## Shared Package

- @event-management/shared provides cross-cutting utilities
- 11+ named exports consumed by both api and web packages
- VERIFY: EM-SHARED-001 — Constants exported from shared (APP_VERSION, BCRYPT_SALT_ROUNDS, etc.)
- VERIFY: EM-SHARED-002 — Shared index re-exports all utility functions
