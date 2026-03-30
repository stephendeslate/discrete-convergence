# Edge Cases Specification

## Overview

This document covers boundary conditions, error handling, and edge cases
that the Analytics Engine must handle gracefully.

## Authentication Edge Cases

<!-- VERIFY:EC-EMPTY-BODY — Empty body on register returns 400 -->
### Empty Registration Body
- POST /auth/register with {} returns 400
- ValidationPipe catches missing required fields

<!-- VERIFY:EC-INVALID-JSON — Malformed JSON body returns 400 -->
### Invalid JSON
- Malformed JSON body returns 400 Bad Request
- NestJS built-in body parser handles this

<!-- VERIFY:EC-DUPLICATE-REGISTRATION — Duplicate email returns conflict -->
### Duplicate Registration
- Registering with an existing email returns 409 Conflict
- AuthService checks with findFirst before creating

<!-- VERIFY:EC-NULL-CREDENTIALS — Null email/password returns 400 -->
### Null Credentials
- Login with null email or password returns 400
- ValidationPipe @IsEmail/@IsString catches null values

<!-- VERIFY:EC-EXTRA-FIELDS — Non-whitelisted fields rejected with 400 -->
### Extra Fields
- Sending isAdmin: true in registration body returns 400
- forbidNonWhitelisted: true rejects unknown properties

## Authorization Edge Cases

<!-- VERIFY:EC-UNAUTHENTICATED — Protected routes return 401 without token -->
### Unauthenticated Access
- GET /dashboards without Authorization header returns 401
- AuthGuard('jwt') rejects missing/invalid tokens

<!-- VERIFY:EC-FORBIDDEN-TENANT — Cross-tenant access is blocked -->
### Cross-Tenant Access
- User cannot access resources from another tenant
- TenantGuard + RLS provide double protection

## Input Validation Edge Cases

<!-- VERIFY:EC-NEGATIVE-LIMIT — Negative limit parameter is handled -->
### Negative Pagination Limit
- GET /dashboards?limit=-1 is handled gracefully
- clampPagination normalizes to minimum values

<!-- VERIFY:EC-OVERFLOW-PAGE — Overflow page number returns empty results -->
### Overflow Page Number
- GET /dashboards?page=999999 returns empty data array
- Does not crash or throw

<!-- VERIFY:EC-BOUNDARY-MAXLENGTH — Strings exceeding MaxLength are rejected -->
### MaxLength Exceeded
- Strings exceeding @MaxLength return 400
- All DTO string fields have MaxLength constraints

## Routing Edge Cases

<!-- VERIFY:EC-NOT-FOUND — Non-existent routes return 404 -->
### Non-Existent Route
- GET /non-existent-route returns 404
- NestJS default 404 handler

<!-- VERIFY:EC-HEALTH-NO-AUTH — Health endpoint works without auth -->
### Health Without Auth
- GET /health returns 200 without any authentication
- Monitoring endpoints are explicitly public

## Performance Edge Cases

<!-- VERIFY:EC-TIMEOUT — Requests respond within timeout threshold -->
### Timeout Handling
- All endpoints respond within 5000ms
- No blocking operations on main thread

<!-- VERIFY:EC-CONCURRENT — Concurrent requests don't crash -->
### Concurrent Requests
- Multiple simultaneous requests handled without errors
- Connection pooling via Prisma prevents exhaustion

## Response Headers Edge Cases

<!-- VERIFY:EC-CORRELATION-HEADER — All responses include correlation ID -->
### Correlation ID Present
- Every response includes x-correlation-id header
- CorrelationInterceptor runs globally

## Data Integrity Edge Cases

### Empty String Fields
- Empty strings pass @IsString but fail @MinLength where applied
- Password requires @MinLength(8)

### UUID Format
- @MaxLength(36) on UUID fields prevents oversized IDs
- Invalid UUIDs caught at database level

### JSON Config Fields
- Widget config and DataSource connectionConfig accept any valid JSON
- Prisma Json type handles serialization

## Implementation Traceability

<!-- VERIFY:EC-AUTH-EMPTY — Empty auth credentials returns 400 -->
<!-- VERIFY:EC-AUTH-INVALID — Invalid auth credentials returns 401 -->
<!-- VERIFY:EC-CORRELATION-ID — Correlation ID present in responses -->
<!-- VERIFY:EC-DUPLICATE-CONFLICT — Duplicate resource returns conflict -->
<!-- VERIFY:EC-FORBIDDEN-OWNERSHIP — Cross-ownership access is blocked -->
<!-- VERIFY:EC-INPUT-BOUNDARY — Input boundary validation -->
<!-- VERIFY:EC-OVERFLOW-PAGINATION — Overflow pagination handled -->
<!-- VERIFY:EC-SUITE — Edge case test suite -->
<!-- VERIFY:EC-TIMEOUT-HANDLING — Timeout handling in tests -->
