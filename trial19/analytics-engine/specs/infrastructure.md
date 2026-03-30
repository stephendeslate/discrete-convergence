# Infrastructure Specification

## Overview

Docker multi-stage builds, CI/CD pipeline, database seeding, and environment configuration.

## Requirements

### AE-INFRA-001: Health Endpoint
- **VERIFY**: Health endpoint at /health is @Public with NO @SkipThrottle
- Returns APP_VERSION from shared constants
- Readiness check tests database connectivity

### AE-INFRA-002: Database Seed
- **VERIFY**: Seed creates tenant, admin user, viewer user, dashboards (including archived), data source, widgets
- Uses BCRYPT_SALT_ROUNDS from shared package for password hashing

### AE-INFRA-003: Environment Validation
- **VERIFY**: validateEnvVars() called at startup for DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET
- Missing variables throw descriptive error before app starts
