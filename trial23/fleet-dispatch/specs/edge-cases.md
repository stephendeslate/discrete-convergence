# Edge Cases Specification

## Overview
Error handling and boundary conditions across the Fleet Dispatch platform.

## Requirements

### FD-EDGE-001: Duplicate Email
<!-- VERIFY: FD-EDGE-001 -->
Registration with an already-existing email returns 409 Conflict with a clear error message.

### FD-EDGE-002: Expired JWT
<!-- VERIFY: FD-EDGE-002 -->
Expired or malformed JWT tokens return 401 Unauthorized with a descriptive message. No stack traces exposed.

### FD-EDGE-003: Non-existent Resource
<!-- VERIFY: FD-EDGE-003 -->
Requesting a work order (or other entity) with a non-existent ID within the tenant's scope returns 404 Not Found.

### FD-EDGE-004: Validation Errors
<!-- VERIFY: FD-EDGE-004 -->
Malformed request bodies return 400 Bad Request with field-level validation details from class-validator.

### FD-EDGE-005: Page Below Minimum
<!-- VERIFY: FD-EDGE-005 -->
Page parameter < 1 is clamped to 1 via clampPagination. No error is returned.

### FD-EDGE-006: Limit Above Maximum
<!-- VERIFY: FD-EDGE-006 -->
Limit parameter > MAX_PAGE_SIZE (100) is clamped to MAX_PAGE_SIZE via clampPagination.

### FD-EDGE-007: Wrong Password
<!-- VERIFY: FD-EDGE-007 -->
Login with incorrect password returns 401 Unauthorized with generic "Invalid credentials" message (no timing leak about which field was wrong).

### FD-EDGE-008: Optimistic Locking
<!-- VERIFY: FD-EDGE-008 -->
Route updates use version field for optimistic locking. Concurrent modification detected via version mismatch.

### FD-EDGE-009: Concurrent Assignment
<!-- VERIFY: FD-EDGE-009 -->
Concurrent work order assignment to the same route returns 409 Conflict when version mismatch is detected.

### FD-EDGE-010: Missing Auth Header
<!-- VERIFY: FD-EDGE-010 -->
Requests to protected endpoints without an Authorization header return 401 Unauthorized.
