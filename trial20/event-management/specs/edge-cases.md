# Edge Cases Specification

## Overview

This document catalogs edge cases and boundary conditions across the
Event Management Platform. Each entry describes a scenario, expected
behavior, and the component responsible for handling it.

## Authentication Edge Cases

VERIFY: EM-EDGE-001 — Login with non-existent email returns 401, not 500

When a user attempts to login with an email that does not exist in the database,
the auth service returns a 401 Unauthorized response. It does NOT leak whether
the email exists by returning different error messages for "user not found"
vs "wrong password".

VERIFY: EM-EDGE-002 — Registration with duplicate email returns 409 Conflict

If a user registers with an email already taken in the same tenant, the service
returns 409 Conflict. The error message does not expose internal details.

VERIFY: EM-EDGE-003 — Expired JWT token returns 401, not 500

When a JWT token has expired, the passport strategy rejects it with a 401.
The error response includes the correlation ID for debugging.

See: authentication.md for token lifecycle
See: security.md for error response format

## Event Edge Cases

VERIFY: EM-EDGE-004 — Get non-existent event returns 404 with correlationId

When requesting an event by ID that does not exist, the service throws
NotFoundException. The global exception filter formats this as a 404 response
with the correlation ID included.

VERIFY: EM-EDGE-005 — Create event with endDate before startDate is rejected

The event DTO validates that endDate is after startDate. If validation fails,
a 400 Bad Request is returned.

See: api-endpoints.md for event endpoint specs
See: cross-layer.md for error path testing

## Registration Edge Cases

VERIFY: EM-EDGE-006 — Registration for non-published event returns 400

Only events with status PUBLISHED accept registrations. Attempting to register
for a DRAFT or CANCELLED event returns 400 Bad Request.

VERIFY: EM-EDGE-007 — Registration at capacity results in WAITLISTED status

When an event has reached maxAttendees, new registrations are automatically
assigned WAITLISTED status instead of CONFIRMED. The response still returns
201 Created with the waitlisted registration.

VERIFY: EM-EDGE-008 — Duplicate registration returns 409 Conflict

The unique constraint on (eventId, attendeeId) prevents duplicate registrations.
If attempted, the service returns 409 Conflict.

See: api-endpoints.md for registration logic
See: data-model.md for unique constraint

## Pagination Edge Cases

VERIFY: EM-EDGE-009 — Page limit exceeding MAX_PAGE_SIZE is clamped to 100

The clampPagination utility from the shared package ensures that:
- limit values > MAX_PAGE_SIZE (100) are clamped to MAX_PAGE_SIZE
- page values < 1 default to 1
- limit values < 1 default to DEFAULT_PAGE_SIZE (20)

See: performance.md for pagination strategy

## Infrastructure Edge Cases

VERIFY: EM-EDGE-010 — Database disconnection returns health/ready with database: disconnected

When the database is unreachable, the health/ready endpoint returns status 200
with database: "disconnected" instead of throwing a 500 error. This allows
orchestrators to detect degraded state without triggering crash loops.

VERIFY: EM-EDGE-011 — Missing required env vars cause startup failure with clear message

The validateEnvVars function checks for required environment variables at
startup. Missing variables cause the process to exit with a descriptive error
message listing which variables are missing.

See: infrastructure.md for env validation
See: monitoring.md for health check behavior

## Security Edge Cases

VERIFY: EM-EDGE-012 — SQL injection in login email is safely handled

Prisma's parameterized queries prevent SQL injection. When a malicious email
like "admin@test.com' OR 1=1--" is submitted, it is treated as a literal
string and findFirst returns null (no match).

VERIFY: EM-EDGE-013 — XSS in URL path returns 404 without reflecting script tags

When a request is made to a path containing script tags, the response returns
404 and the error message does NOT reflect the script content back.

See: security.md for input validation
See: cross-layer.md for security integration tests
