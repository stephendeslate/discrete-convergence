# Edge Cases Specification

## Overview

This specification documents edge cases, boundary conditions, and error scenarios
that the Analytics Engine must handle correctly. Each entry identifies a specific
edge case with its expected behavior and the component responsible for handling it.

See also: security.md for security-related edge cases.
See also: api-endpoints.md for validation rules at API boundaries.
See also: authentication.md for auth-related edge cases.

## Authentication Edge Cases

VERIFY: AE-EDGE-001 — Empty email or password in login request returns 400 validation error
VERIFY: AE-EDGE-002 — Expired JWT token returns 401 without leaking expiry details
VERIFY: AE-EDGE-003 — Malformed JWT token (truncated or tampered) returns 401 Unauthorized

- Login with empty email: ValidationPipe rejects with 400
- Login with empty password: ValidationPipe rejects with 400
- Register with existing email: ConflictException returns 409
- Register with ADMIN role: @IsIn(ALLOWED_REGISTRATION_ROLES) rejects with 400
- Expired token: JwtAuthGuard returns 401
- Malformed token: JwtAuthGuard returns 401
- Missing Authorization header: JwtAuthGuard returns 401

## Pagination Edge Cases

VERIFY: AE-EDGE-004 — Page number below 1 is clamped to 1 by clampPagination
VERIFY: AE-EDGE-005 — Limit exceeding MAX_PAGE_SIZE (100) is clamped to maximum

- page=0: clamped to 1 via clampPagination
- page=-1: clamped to 1
- limit=0: clamped to 1
- limit=999: clamped to MAX_PAGE_SIZE (100)
- Non-numeric page: ValidationPipe transform converts or rejects
- Very large page number: returns empty results array with correct total

## Tenant Isolation Edge Cases

VERIFY: AE-EDGE-006 — Cross-tenant resource access returns 404 not 403 to prevent enumeration

- Accessing another tenant's dashboard: returns 404 (not 403, to prevent enumeration)
- Accessing another tenant's data source: returns 404
- Creating resource: tenantId from JWT, not from request body
- Updating resource: verify tenantId matches before update
- Deleting resource: verify tenantId matches before delete

## Input Validation Edge Cases

VERIFY: AE-EDGE-007 — Extra fields in request body are rejected by forbidNonWhitelisted
VERIFY: AE-EDGE-008 — XSS payload in string fields is stored safely (no raw HTML rendering)

- Extra fields in request body: rejected by forbidNonWhitelisted (400)
- Missing required fields: rejected by class-validator (400)
- XSS in string fields: stored as-is but never rendered as raw HTML
- SQL injection in string fields: Prisma parameterization prevents execution
- Very long string values: @MaxLength decorator enforces limits
- Unicode in names: accepted and stored correctly

## Database Edge Cases

VERIFY: AE-EDGE-009 — Database connection failure returns 503 on readiness check

- Database connection lost: health/ready returns error state
- Concurrent updates: Prisma handles via optimistic locking
- Seed script on empty database: creates initial data successfully
- Seed script on populated database: handles duplicate gracefully

## Rate Limiting Edge Cases

VERIFY: AE-EDGE-010 — Burst of requests exceeding rate limit returns 429 Too Many Requests

- Burst exceeding limit: ThrottlerGuard returns 429
- Exactly at limit: request succeeds
- Rate limit on public vs protected: same ThrottlerGuard applies
- Auth endpoints stricter: 10 req/sec vs 100 req/sec default

## Frontend Edge Cases

VERIFY: AE-EDGE-011 — Missing auth cookie redirects to login prompt on protected pages

- No auth cookie: server actions return error, page shows login prompt
- Expired cookie: API returns 401, frontend handles gracefully
- API unreachable: server actions catch fetch error, display message
- Empty dashboard list: shows empty state message
- Empty data source list: shows empty state message

## Error Boundary Edge Cases

VERIFY: AE-EDGE-012 — Error boundaries catch rendering errors and provide recovery button

- Component render error: error.tsx catches with role="alert"
- Error focus management: useRef focuses heading on mount
- Recovery: reset function provided for retry
- Loading state: loading.tsx shows skeleton with aria-busy
