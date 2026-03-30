# Edge Cases Specification

## Overview

This document catalogs edge cases, boundary conditions, error states,
and unusual input scenarios that the system must handle correctly.

## Authentication Edge Cases

- Empty email string rejected by class-validator @IsEmail
- Password with maximum length accepted by RegisterDto
- Duplicate email registration returns 409 ConflictException
- Expired JWT token returns 401 UnauthorizedException
- Missing Authorization header returns 401
- Malformed JWT (invalid signature) returns 401
- Wrong role attempting ADMIN-only endpoint returns 403

## Pagination Edge Cases

- Page 0 or negative clamped to page 1 by clampPagination
- Limit exceeding MAX_PAGE_SIZE clamped to 100
- Limit 0 or negative clamped to 1

## Data Validation Edge Cases

- Extra fields in request body rejected by forbidNonWhitelisted
- Null required fields rejected by class-validator
- String exceeding MaxLength rejected (e.g., title > 500 chars)

## Multi-Tenancy Edge Cases

- User cannot access resources from different tenant
- findOne returns 404 when entity belongs to different tenant

## Database Edge Cases

- Delete of non-existent entity returns 404
- Update of non-existent entity returns 404
- Concurrent registration with same email handled by unique constraint

## Error State Data

- Seed includes cancelled event for error state testing
- Empty result set returns { data: [], total: 0 }

## Boundary Conditions

- Decimal fields accept exactly 12 integer digits and 2 decimal places
- VarChar fields enforce database-level length limits
- UUID primary keys generated server-side (not client-provided)
- DateTime fields accept ISO 8601 format strings

## Rate Limiting Edge Cases

- Exceeding short limit (100/sec) returns 429
- Login endpoint stricter limit (10/sec) prevents brute force
- Rate limits reset after TTL window expires

## Health Check Edge Cases

- /health responds even when database is down
- /health/ready fails with 500 when database is unreachable
- Health endpoints are not rate-limited differently (no @SkipThrottle)

## Verification Cross-References

These edge cases are verified by the following traced implementations:

VERIFY: EM-AUTH-001 — JwtAuthGuard handles missing and invalid tokens
VERIFY: EM-AUTH-002 — RegisterDto validates allowed roles and input constraints
VERIFY: EM-AUTH-004 — AuthService handles duplicate email registration
VERIFY: EM-SEC-003 — RolesGuard enforces role-based access on protected endpoints
VERIFY: EM-SEC-007 — ValidationPipe rejects extra fields and invalid input
VERIFY: EM-SHARED-003 — clampPagination handles boundary values for page and limit
VERIFY: EM-MON-003 — GlobalExceptionFilter handles all error types consistently
VERIFY: EM-MON-004 — HealthController handles database availability edge cases
VERIFY: EM-DATA-001 — PrismaService manages connection lifecycle for database edge cases
VERIFY: EM-SEC-008 — setTenantContext enforces tenant isolation at database level

## Related Specs

See [authentication.md](authentication.md) for auth error handling.
See [data-model.md](data-model.md) for field constraints.
See [api-endpoints.md](api-endpoints.md) for validation rules.
See [security.md](security.md) for rate limiting configuration.
