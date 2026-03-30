# Edge Cases Specification

> **Project:** Analytics Engine
> **Category:** EDGE
> **Related:** See [authentication.md](authentication.md) for auth error flows, see [api-endpoints.md](api-endpoints.md) for endpoint validation, see [data-model.md](data-model.md) for constraints

---

## Overview

This specification defines edge case behaviors that the analytics engine must handle correctly. Each edge case is testable and maps to specific error conditions, boundary values, or exceptional inputs. These cases ensure the system degrades gracefully and returns appropriate HTTP status codes and error messages.

---

## Requirements

### VERIFY: AE-EDGE-001 — Duplicate email registration returns 409 Conflict

When a user attempts to register with an email address that already exists in the database, the auth service catches the Prisma unique constraint violation (`P2002`) and returns a 409 Conflict response. The error message indicates that the email is already registered without leaking other user details. This handles the **duplicate** registration edge case at both the database constraint level (unique index on email) and the application level (conflict detection in the service).

### VERIFY: AE-EDGE-002 — Invalid JWT token returns 401 Unauthorized

When a request includes a malformed, expired, or tampered JWT token in the Authorization header, the JwtAuthGuard rejects the request with a 401 **Unauthorized** response. This covers multiple **invalid** token scenarios: expired tokens (past `exp` claim), tokens signed with a wrong secret, tokens with modified payloads, tokens with invalid Base64 encoding, and completely random strings passed as Bearer tokens. The error response does not reveal the specific reason for rejection to prevent information leakage.

### VERIFY: AE-EDGE-003 — Dashboard not found returns 404 Not Found

When a user requests a dashboard by ID that does not exist or belongs to a different tenant, the dashboard service returns a 404 **Not Found** response. The service first queries with both the dashboard ID and the authenticated user's tenantId. If no matching record is found (either because the ID is **not-found** or tenant isolation prevents access), the response is 404 with a generic "Dashboard not found" message. The system does not distinguish between non-existent and tenant-isolated resources to prevent enumeration attacks.

### VERIFY: AE-EDGE-004 — Malformed request body returns 400 Bad Request

When a request body contains **malformed** JSON or fails DTO validation, the ValidationPipe returns a 400 Bad Request response with structured error details. Examples include: missing required fields, wrong data types (string where number expected), **invalid** enum values for widget type or data source type, strings exceeding `@MaxLength()` limits, and completely unparseable JSON bodies. The error response includes an array of validation error messages identifying which fields failed and why.

### VERIFY: AE-EDGE-005 — Empty/null pagination defaults to DEFAULT_PAGE_SIZE boundary

When list endpoints receive empty, **null**, undefined, or missing pagination parameters, the `clampPagination` function applies **boundary** defaults. Missing `page` defaults to 1, missing `limit` defaults to `DEFAULT_PAGE_SIZE` (20). Explicitly passing `null` or empty string for either parameter triggers the same defaults. The `page` parameter has a minimum **boundary** of 1 — values of 0 or negative numbers are clamped to 1. This ensures pagination always produces valid SQL OFFSET/LIMIT values.

### VERIFY: AE-EDGE-006 — Overflow page size clamped to MAX_PAGE_SIZE boundary

When a client requests a page size exceeding `MAX_PAGE_SIZE` (100), the `clampPagination` function clamps the value to the **boundary** maximum of 100 rather than rejecting the request. An **overflow** value like `limit=999999` becomes `limit=100`. Similarly, `limit=0` is clamped to `DEFAULT_PAGE_SIZE` (20), and negative values are also clamped. This prevents excessive memory allocation from unbounded query results while providing a seamless client experience without **error** responses for slightly-too-large page sizes.

### VERIFY: AE-EDGE-007 — Forbidden role (ADMIN) on registration returns 403

When a user attempts to register with `role: 'ADMIN'`, the request is rejected with a 403 **Forbidden** response. The `ALLOWED_REGISTRATION_ROLES` constant from the shared package explicitly excludes ADMIN. The `@IsIn(ALLOWED_REGISTRATION_ROLES)` validator on the registration DTO catches this before the service layer. This prevents privilege escalation through self-registration. Only roles in the allowed list (typically EDITOR and VIEWER) are accepted for self-registration.

### VERIFY: AE-EDGE-008 — DataSource sync with invalid ID returns 404 Not Found

When `POST /data-sources/:id/sync` is called with an ID that does not exist or belongs to a different tenant, the service returns a 404 **Not Found** response. The service queries for the data source using both the provided ID and the authenticated user's tenantId. If the data source is **not-found** (non-existent or tenant-isolated), the sync is not triggered and a 404 is returned. This prevents triggering syncs on resources the user does not own.

### VERIFY: AE-EDGE-009 — Error in sync creates FAILED status with error message

When a data source synchronization encounters an **error** (connection failure, **timeout**, parse **error**, or upstream API failure), the sync service catches the exception, sets the SyncHistory record status to `FAILED`, writes the **error** message to the `errorMessage` field, sets `completedAt` to the current timestamp, and does not propagate the exception to the client. The sync trigger endpoint returns 200 with the SyncHistory record showing FAILED status. The **error** message is stored for debugging but sanitized to remove sensitive connection details.

### VERIFY: AE-EDGE-010 — Unauthorized access without token returns 401

When a request to a protected endpoint (any endpoint not decorated with `@Public()`) is made without an Authorization header or with an empty Bearer token, the JwtAuthGuard returns a 401 **Unauthorized** response. This covers the **unauthorized** access case where no credentials are provided at all. The response body includes a generic "Unauthorized" message without revealing which endpoints exist or what authentication method is expected. Health endpoints (`/health`, `/health/ready`) and auth endpoints (`/auth/login`, `/auth/register`) are exempt from this check.

---

## Edge Case Summary

| # | Edge Case | HTTP Status | Keywords |
|---|-----------|-------------|----------|
| 001 | Duplicate email registration | 409 Conflict | duplicate, conflict |
| 002 | Invalid JWT token | 401 Unauthorized | invalid, unauthorized |
| 003 | Dashboard not found | 404 Not Found | not-found |
| 004 | Malformed request body | 400 Bad Request | malformed, invalid |
| 005 | Empty/null pagination | 200 (defaults) | null, boundary |
| 006 | Overflow page size | 200 (clamped) | overflow, boundary |
| 007 | Forbidden ADMIN registration | 403 Forbidden | forbidden |
| 008 | Sync with invalid ID | 404 Not Found | not-found |
| 009 | Sync error handling | 200 (FAILED) | error, timeout |
| 010 | No auth token | 401 Unauthorized | unauthorized |

---

## Testing Strategy

Each edge case maps to at least one integration test assertion. Tests use supertest with a compiled NestJS AppModule to verify the full request pipeline including guards, pipes, filters, and interceptors. Edge case tests verify both the HTTP status code and the response body structure.
