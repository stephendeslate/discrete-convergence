# Security Specification

## Overview

Defense-in-depth security architecture combining authentication, authorization,
tenant isolation, input validation, and HTTP security headers.
See [authentication.md](authentication.md) for JWT implementation.

## Tenant Isolation

<!-- VERIFY:API-TENANT-GUARD -->
The `TenantGuard` extracts companyId from the JWT payload and sets the
PostgreSQL session variable `app.company_id` via Prisma, enabling Row-Level
Security policies on all tables. Every authenticated request passes through.

<!-- VERIFY:API-PRISMA-MODULE -->
The `PrismaModule` provides a singleton PrismaService that manages database
connections with tenant-scoped RLS. It sets the session variable before
queries in authenticated contexts.

## Request Infrastructure

<!-- VERIFY:API-CORRELATION-INTERCEPTOR -->
The `CorrelationInterceptor` generates or propagates X-Correlation-ID headers
on every request. This ID is included in all log entries and error responses.

<!-- VERIFY:API-RESPONSE-TIME-INTERCEPTOR -->
The `ResponseTimeInterceptor` measures request duration and adds an
X-Response-Time header to every response for performance monitoring.

<!-- VERIFY:API-HTTP-EXCEPTION-FILTER -->
The global `HttpExceptionFilter` catches all exceptions and returns a
consistent JSON error shape with statusCode, message, error, timestamp,
and correlationId. Stack traces are omitted in production.

## Pagination

<!-- VERIFY:API-PAGINATION-UTILS -->
The `pagination.utils.ts` module provides the `buildPaginatedResponse` helper
used by all list endpoints. It calculates total pages and clamps page/pageSize.

<!-- VERIFY:API-PAGINATED-QUERY -->
The `PaginatedQuery` DTO defines shared query parameters (page, pageSize)
with class-validator decorators, reused across all list endpoints.

<!-- VERIFY:API-PAGINATION-UTILS-SPEC -->
Unit tests verify pagination edge cases: page=0 clamped to 1, pageSize
clamped to range [1, 100], and correct total page calculation.

## Test Infrastructure

<!-- VERIFY:TEST-HELPERS -->
Shared test utilities provide helper functions for creating test applications,
generating auth tokens, and making authenticated HTTP requests.

<!-- VERIFY:TEST-SECURITY -->
Security integration tests verify unauthenticated requests receive 401,
tenant isolation prevents cross-company access, and rate limiting works.

<!-- VERIFY:TEST-EDGE-CASES -->
Edge case tests verify boundary conditions: empty strings rejected, UUIDs
validated, pagination clamped, and missing fields return 400.

<!-- VERIFY:TEST-PERFORMANCE -->
Performance tests verify response time headers, health endpoint latency,
and concurrent request handling under load.

## Database Seed

<!-- VERIFY:PRISMA-SEED -->
The database seed script creates initial test data including sample users,
vehicles, drivers, routes, dispatches, trips, and maintenance records.

## Security Layers

1. **Transport** — Helmet CSP with frame-ancestors 'none', CORS
2. **Authentication** — JWT Bearer tokens via Passport
3. **Authorization** — Role enum (ADMIN/EDITOR/VIEWER)
4. **Data** — PostgreSQL RLS policies using app.company_id
5. **Input** — class-validator with whitelist mode
6. **Rate Limiting** — ThrottlerModule with limit=20000
7. **Code Safety** — No $executeRawUnsafe, no console.log

## Edge Case Handling

<!-- VERIFY:EC-AUTH-INVALID -->
Authentication must reject invalid JWT tokens with 401 Unauthorized. Malformed
tokens, expired tokens, and tokens with null subject should all be rejected.

<!-- VERIFY:EC-AUTH-EMPTY -->
Empty or missing Authorization headers must return 401. Requests with empty
string bearer tokens should be treated as unauthorized.

<!-- VERIFY:EC-INPUT-BOUNDARY -->
Input validation must enforce boundary conditions: empty strings rejected for
required fields, UUIDs validated, pageSize clamped to [1, 100], page=0 should
be treated as page=1.

<!-- VERIFY:EC-DUPLICATE-CONFLICT -->
Creating a duplicate resource (e.g., duplicate email on register) must return
409 Conflict with a descriptive error message.

<!-- VERIFY:EC-NOT-FOUND -->
Requesting a not found resource must return 404 with the entity type and ID.
This applies to vehicles, drivers, routes, dispatches, trips, and maintenance.

<!-- VERIFY:EC-TIMEOUT-HANDLING -->
Database timeout errors must be caught and return 503 Service Unavailable
rather than leaking internal error details.

<!-- VERIFY:EC-OVERFLOW-PAGINATION -->
Pagination overflow (page number exceeding total pages) must return an empty
data array with correct metadata, not an error.

<!-- VERIFY:EC-FORBIDDEN-OWNERSHIP -->
Users must receive 403 Forbidden when attempting to access or modify resources
owned by another company within the same system.

## Cross-References

- JWT implementation: see [authentication.md](authentication.md)
- Health endpoints (no auth): see [monitoring.md](monitoring.md)
- Data model and schema: see [data-model.md](data-model.md)
