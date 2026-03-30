# Security Specification

## Overview

Security is implemented in multiple layers: transport (Helmet, CORS, CSP),
authentication (JWT), authorization (RBAC + ownership), data isolation (RLS),
and input validation (class-validator). See [authentication.md](authentication.md)
for JWT implementation details.

## Tenant Guard

<!-- VERIFY:TENANT-GUARD -->
The `TenantGuard` extracts tenantId from the JWT payload and sets the PostgreSQL
session variable `app.tenant_id` via Prisma, enabling Row-Level Security policies
on all tables. Every authenticated request passes through this guard.

## Exception Handling

<!-- VERIFY:EXCEPTION-FILTER -->
The global `HttpExceptionFilter` catches all exceptions and returns a consistent
JSON error shape with statusCode, message, error, timestamp, and correlationId.
Stack traces are omitted in production.

## Correlation Tracking

<!-- VERIFY:CORRELATION -->
The `CorrelationInterceptor` generates or propagates X-Correlation-ID headers
on every request. This ID is included in all log entries and error responses
for end-to-end request tracing.

## Response Timing

<!-- VERIFY:RESPONSE-TIME -->
The `ResponseTimeInterceptor` measures request duration and adds an
X-Response-Time header (in milliseconds) to every response. This supports
performance monitoring and SLA tracking.

## Security Tests

<!-- VERIFY:TEST-SECURITY -->
Security integration tests verify that unauthenticated requests receive 401,
that tenant isolation prevents cross-tenant data access, and that rate limiting
returns 429 when thresholds are exceeded.

## Layers

1. **Transport** — Helmet CSP with frame-ancestors 'none', CORS whitelist
2. **Authentication** — JWT Bearer tokens via Passport
3. **Authorization** — Role enum (ADMIN/EDITOR/VIEWER), ownership checks
4. **Data** — PostgreSQL RLS policies on every table using app.tenant_id
5. **Input** — class-validator decorators, whitelist mode, forbidNonWhitelisted
6. **Rate Limiting** — ThrottlerModule with 20000 req/min per IP

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
This applies to dashboards, widgets, and data sources.

<!-- VERIFY:EC-TIMEOUT-HANDLING -->
Database timeout errors must be caught and return 503 Service Unavailable
rather than leaking internal error details.

<!-- VERIFY:EC-OVERFLOW-PAGINATION -->
Pagination overflow (page number exceeding total pages) must return an empty
data array with correct metadata, not an error.

<!-- VERIFY:EC-FORBIDDEN-OWNERSHIP -->
Users must receive 403 Forbidden when attempting to access or modify resources
owned by another user within the same tenant.

## Cross-References

- JWT strategy and tokens: see [authentication.md](authentication.md)
- Dashboard ownership enforcement: see [dashboards.md](dashboards.md)
- Health endpoints (no auth required): see [monitoring.md](monitoring.md)

<!-- VERIFY:CORRELATION-INTERCEPTOR-SPEC -->
<!-- VERIFY:HTTP-EXCEPTION-FILTER-SPEC -->
<!-- VERIFY:TENANT-GUARD-SPEC -->
<!-- VERIFY:RESPONSE-TIME-INTERCEPTOR-SPEC -->
