# Cross-Layer Integration Specification

## Overview

The Analytics Engine is designed with clear separation of concerns across layers:
frontend (Next.js), API (NestJS), shared utilities, and infrastructure. This
specification documents how these layers interact and the integration contracts
between them.

See also: api-endpoints.md for the REST contract between frontend and backend.
See also: authentication.md for the auth flow spanning frontend and backend.
See also: monitoring.md for observability across all layers.

## Layer Architecture

1. Frontend Layer (Next.js 15)
   - Server components for data fetching
   - Client components for interactive forms
   - Server actions for API communication

2. API Layer (NestJS 11)
   - Controllers handle HTTP request/response
   - Services contain business logic
   - Guards enforce authentication and authorization
   - Middleware provides cross-cutting concerns

3. Shared Layer (TypeScript package)
   - Constants consumed by both API and frontend
   - Validators used in API and available to frontend
   - Sanitizers used in API logging

4. Infrastructure Layer (Docker, CI)
   - Container orchestration
   - Database management
   - CI/CD pipeline

VERIFY: AE-CROSS-001 — Full request pipeline verified from health through auth to error handling

## Integration Contracts

### Frontend -> API
- All communication via server actions (lib/actions.ts)
- Token stored in httpOnly cookie, extracted per request
- Authorization Bearer header included in authenticated requests
- API_URL environment variable configures API base URL
- Error responses parsed and displayed to user

### API -> Shared
- Constants: BCRYPT_SALT_ROUNDS, ALLOWED_REGISTRATION_ROLES, MAX_PAGE_SIZE, etc.
- Utilities: createCorrelationId, clampPagination, paginationToSkipTake
- Validators: validateEnvVars for startup validation
- Sanitizers: sanitizeLogContext for log security

### API -> Database
- Prisma ORM for all database operations
- RLS policies for tenant isolation
- Migrations managed via Prisma migrate
- Seed script for initial data

## Middleware Chain

Request processing order:
1. CorrelationIdMiddleware — assigns X-Correlation-ID
2. RequestLoggingMiddleware — logs request entry
3. ThrottlerGuard — rate limiting check
4. JwtAuthGuard — authentication check (skipped for @Public)
5. RolesGuard — authorization check (skipped without @Roles)
6. ValidationPipe — request body validation
7. Controller handler — business logic
8. ResponseTimeInterceptor — adds X-Response-Time header
9. GlobalExceptionFilter — catches and formats errors

## Error Propagation

- API errors include statusCode, message, correlationId
- Frontend server actions catch errors and return { error: string }
- Client components display errors with role="alert"
- Error boundaries (error.tsx) catch rendering errors

## Health Check Integration

- Docker HEALTHCHECK calls GET /health
- Kubernetes liveness probe: GET /health
- Kubernetes readiness probe: GET /health/ready
- Database connectivity verified via $queryRaw
