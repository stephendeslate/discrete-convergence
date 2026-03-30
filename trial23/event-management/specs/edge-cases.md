# Edge Cases Specification

> **Project:** Event Management
> **Domain:** EDGE
> **VERIFY Tags:** EM-EDGE-001 – EM-EDGE-010

---

## Overview

Boundary conditions, error handling, and failure scenarios that must be handled
gracefully. Each edge case maps to specific error responses and has corresponding
implementation in the source code traced via TRACED tags.

---

## Requirements

### EM-EDGE-001: Duplicate Email Registration

<!-- VERIFY: EM-EDGE-001 -->

- Attempting to register with an existing email returns 409 Conflict.
- Error message: "Email already registered" or similar.
- Prisma unique constraint violation is caught and mapped to ConflictException.

### EM-EDGE-002: Invalid JWT Token

<!-- VERIFY: EM-EDGE-002 -->

- Requests with malformed or expired JWT return 401 Unauthorized.
- JwtAuthGuard `handleRequest` method throws UnauthorizedException.
- Error message is generic to avoid leaking token details.

### EM-EDGE-003: Event Not Found

<!-- VERIFY: EM-EDGE-003 -->

- Requesting a non-existent event returns 404 Not Found.
- Event must match both ID and organizationId (tenant isolation).
- `findFirst` used with both conditions; comment explains composite lookup.

### EM-EDGE-004: Malformed Request Body

<!-- VERIFY: EM-EDGE-004 -->

- Invalid request bodies return 400 Bad Request.
- ValidationPipe with `forbidNonWhitelisted: true` rejects unknown fields.
- GlobalExceptionFilter formats the error response consistently.

### EM-EDGE-005: Null Pagination Parameters

<!-- VERIFY: EM-EDGE-005 -->

- Missing `page` parameter defaults to 1.
- Missing `limit` parameter defaults to DEFAULT_PAGE_SIZE (20).
- `clampPagination()` handles undefined/null/NaN inputs safely.

### EM-EDGE-006: Overflow Page Size

<!-- VERIFY: EM-EDGE-006 -->

- Requesting `limit > MAX_PAGE_SIZE` is clamped to MAX_PAGE_SIZE (100).
- Requesting `limit < 1` is clamped to 1.
- Requesting `page < 1` is clamped to 1.

### EM-EDGE-007: Forbidden ADMIN Role Registration

<!-- VERIFY: EM-EDGE-007 -->

- Attempting to self-register with role ADMIN returns 403 Forbidden.
- Only ORGANIZER and ATTENDEE roles are allowed for self-registration.
- `ALLOWED_REGISTRATION_ROLES` from shared package defines the whitelist.

### EM-EDGE-008: Registration for Invalid Event

<!-- VERIFY: EM-EDGE-008 -->

- Registering for a non-existent event returns 404 Not Found.
- Event existence is verified before creating the registration.
- Error message includes the requested event ID.

### EM-EDGE-009: Registration Error Handling

<!-- VERIFY: EM-EDGE-009 -->

- Registration failures include descriptive error messages.
- Capacity overflow, invalid ticket type, and duplicate registration are handled.
- Error responses include the specific failure reason.

### EM-EDGE-010: No Token Provided

<!-- VERIFY: EM-EDGE-010 -->

- Requests without an Authorization header return 401 Unauthorized.
- JwtAuthGuard checks for token presence before validation.
- Public endpoints (decorated with `@Public()`) bypass this check.
