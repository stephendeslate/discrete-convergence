# Edge Cases Specification

## Overview

This document covers boundary conditions, error scenarios, race conditions,
and edge cases for the Fleet Dispatch platform.

<!-- VERIFY: FD-EDGE-001 — Empty list returns { data: [], total: 0 } not null -->
When no records exist, list endpoints return an empty array with total 0,
not null or undefined. This prevents frontend null reference errors.

<!-- VERIFY: FD-EDGE-002 — Duplicate email registration returns 409 ConflictException -->
If a user attempts to register with an already-used email, the system returns
HTTP 409 instead of a 500 from the unique constraint violation.

<!-- VERIFY: FD-EDGE-003 — Invalid UUID path parameter returns 404 not 500 -->
When an entity is not found (invalid ID), findOne throws NotFoundException
returning 404, not an unhandled Prisma error.

<!-- VERIFY: FD-EDGE-004 — Pagination with page=0 or negative defaults to page 1 -->
parsePagination normalizes invalid page values to page 1 and clamps limit
to MAX_PAGE_SIZE to prevent excessive database queries.

<!-- VERIFY: FD-EDGE-005 — Extremely long string inputs are rejected by MaxLength validators -->
All string fields have @MaxLength decorators preventing buffer overflow
and excessive storage consumption.

<!-- VERIFY: FD-EDGE-006 — Concurrent duplicate registration is handled by findFirst check -->
The findFirst check before user creation prevents race condition duplicates
at the application layer, backed by the unique constraint at the database layer.

<!-- VERIFY: FD-EDGE-007 — Expired JWT tokens return 401 UnauthorizedException -->
Tokens with expired timestamps are rejected by Passport JWT strategy,
forcing re-authentication or refresh token usage.

<!-- VERIFY: FD-EDGE-008 — Cross-tenant data access is prevented by tenant_id scoping -->
All queries include tenant_id from the JWT payload, preventing one tenant
from accessing another tenant's data even with valid entity IDs.

<!-- VERIFY: FD-EDGE-009 — Missing required env vars cause startup failure -->
validateEnvVars throws an error if DATABASE_URL or JWT_SECRET is missing,
preventing the application from starting in an unconfigured state.

<!-- VERIFY: FD-EDGE-010 — Malformed JSON request body returns 400 -->
The ValidationPipe with transform: true rejects non-parseable request bodies
with a 400 Bad Request response.

<!-- VERIFY: FD-EDGE-011 — Database connection failure in health/ready returns error status -->
The readiness endpoint catches Prisma connection errors and returns
{ status: 'error', database: 'disconnected' } instead of crashing.

<!-- VERIFY: FD-EDGE-012 — Forbidden extra fields in request body are stripped -->
ValidationPipe with forbidNonWhitelisted: true rejects requests containing
fields not defined in the DTO, preventing mass assignment attacks.
