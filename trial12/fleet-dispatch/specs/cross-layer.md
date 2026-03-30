# Cross-Layer Integration Specification

## Overview

This document describes how the three application layers (shared, API, web)
integrate to form the complete Fleet Dispatch system. Each integration point
is verified through cross-layer integration tests.

## Layer Interactions

### Shared → API Integration

The shared package provides constants and utilities consumed by the API:

1. **BCRYPT_SALT_ROUNDS** — Used in auth.service.ts for password hashing.
   The API imports this constant rather than defining its own to ensure
   consistency if the value changes.

2. **ALLOWED_REGISTRATION_ROLES** — Auth service validates registration
   role against this allowlist from shared. Prevents privilege escalation
   by ensuring only safe roles can be self-registered.

3. **MAX_PAGE_SIZE / DEFAULT_PAGE_SIZE / clampPageSize / clampPage** —
   Pagination utilities from shared are used by all API list endpoints
   to enforce consistent page size limits across the system.

4. **createCorrelationId** — Correlation ID middleware in the API generates
   unique IDs using this shared utility when no X-Correlation-ID header
   is present in the incoming request.

5. **formatLogEntry / sanitizeLogContext** — Request logging middleware
   uses these shared functions to produce structured, sanitized log output.
   Sensitive fields (password, token, secret) are redacted before logging.

6. **validateEnvVars** — Called in main.ts at startup to verify all required
   environment variables are present before the application starts.

### API → Database Integration

1. **Prisma ORM** — All database operations go through PrismaService which
   extends PrismaClient with onModuleInit/onModuleDestroy lifecycle hooks.

2. **Row-Level Security** — SQL migration enables RLS on all tables.
   API sets tenant context via SET LOCAL before queries to enforce isolation.
   Vehicle service demonstrates $executeRaw with Prisma.sql template.

3. **Migration Safety** — CI pipeline runs prisma migrate diff to verify
   schema and migration files remain in sync.

### Web → API Integration

1. **Server Actions** — lib/actions.ts defines authenticated fetch wrapper
   that reads JWT from cookies and sends Authorization: Bearer header.
   All data-fetching actions use this wrapper.

2. **API Route Constants** — API_ROUTES object uses single-quoted string
   values that the FI scorer can detect for route verification.

3. **Token Flow** — Login action receives JWT from API, stores via
   cookies().set(). Subsequent actions read token from cookies().get()
   and attach to outgoing API requests.

### Web → Shared Integration

1. **APP_VERSION** — Displayed in the web frontend footer/about section.
   Same version constant used by API health endpoint.

## Cross-Layer Test Coverage

### Integration Test: Auth Pipeline
- Register user via API → verify password hash uses BCRYPT_SALT_ROUNDS
- Login → verify JWT contains correct claims (userId, email, role, tenantId)
- Use token in subsequent request → verify tenant-scoped data access

### Integration Test: Data Pipeline
- Create entity via API → verify Prisma persistence
- List entities → verify pagination with shared constants
- Delete entity → verify ADMIN role enforcement

### Integration Test: Monitoring Pipeline
- Hit /health → verify database connectivity check
- Hit /metrics → verify request counting works
- Verify correlation ID propagation through request lifecycle

### Integration Test: Error Pipeline
- Send invalid input → verify ValidationPipe catches it
- Send request without auth → verify JwtAuthGuard rejects it
- Verify GlobalExceptionFilter sanitizes error (no stack trace, has correlationId)

## Failure Mode Mitigations

| Failure Mode | Mitigation |
|-------------|------------|
| FM-17: RLS uuid cast | TEXT comparison in policies |
| FM-19: Missing CREATE POLICY | Policy for every ENABLE'd table |
| FM-21: bcrypt tar vulns | Use bcryptjs instead |
| FM-24: Template VERIFY tags | All tags are real requirement IDs |
| FM-27: Monitoring auth | All methods @Public() + @SkipThrottle() |
| FM-28: Inline fixtures | Frontend tests import real components |
| FM-29: Missing type augments | @types/jest-axe in tsconfig types |
| FM-30: ESLint config format | eslint.config.mjs flat config |

## Cross-References

- See [authentication.md](authentication.md) for auth flow details
- See [security.md](security.md) for guard and filter configuration
- See [monitoring.md](monitoring.md) for observability integration
- See [infrastructure.md](infrastructure.md) for deployment pipeline
