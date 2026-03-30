# Edge Cases Specification

## Overview

Edge case requirements covering boundary conditions, error handling, malformed input, and defensive behavior.

## Requirements

### AE-EDGE-001: Empty Email Registration
- **VERIFY**: Registration with empty string email returns 400 validation error
- class-validator @IsEmail() rejects empty, null, and non-email strings

### AE-EDGE-002: Password Length Boundary
- **VERIFY**: Password shorter than 8 characters is rejected at DTO validation
- Maximum password length enforced via @MaxLength to prevent bcrypt DoS

### AE-EDGE-003: SQL Injection in Query Parameters
- **VERIFY**: Prisma parameterized queries prevent SQL injection in search/filter params
- Direct string interpolation never used in database queries

### AE-EDGE-004: XSS in Dashboard Name
- **VERIFY**: HTML entities in dashboard name stored and returned as-is (output encoding is frontend responsibility)
- Helmet CSP prevents inline script execution even if XSS payload stored

### AE-EDGE-005: Expired JWT Token
- **VERIFY**: Expired tokens return 401 Unauthorized, not 500 Internal Server Error
- Token expiry checked before any database access

### AE-EDGE-006: Missing Authorization Header
- **VERIFY**: Requests without Authorization header to protected routes return 401
- Malformed "Bearer" prefix (extra spaces, missing token) returns 401

### AE-EDGE-007: Pagination Overflow
- **VERIFY**: Page size exceeding MAX_PAGE_SIZE clamped to MAX_PAGE_SIZE, not rejected
- Negative page numbers treated as page 1
- Non-numeric page/limit values ignored and defaults applied

### AE-EDGE-008: Concurrent Duplicate Registration
- **VERIFY**: Duplicate email registration returns 409 Conflict
- Prisma unique constraint prevents race condition at database level

### AE-EDGE-009: Non-Existent Resource Access
- **VERIFY**: GET/PATCH/DELETE on non-existent dashboard ID returns 404 Not Found
- 404 response includes correlationId for debugging

### AE-EDGE-010: Cross-Tenant Resource Access
- **VERIFY**: Users cannot access resources belonging to another tenant
- RLS policies enforce isolation even if application code has bugs

### AE-EDGE-011: Extra Fields in Request Body
- **VERIFY**: Extra properties in request body stripped by ValidationPipe (whitelist: true)
- forbidNonWhitelisted causes 400 error for unknown properties

### AE-EDGE-012: Database Disconnection
- **VERIFY**: Health readiness returns degraded status when database is unreachable
- Application does not crash on transient database connectivity loss

### AE-EDGE-013: Empty Dashboard List
- **VERIFY**: GET /dashboards for tenant with no dashboards returns empty array, not 404
- Frontend renders empty state message for empty lists

### AE-EDGE-014: Correlation ID Preservation
- **VERIFY**: Client-provided X-Correlation-ID header preserved through entire request lifecycle
- Generated correlation IDs are valid UUID v4 format
