# Edge Cases Specification

## Overview

This document catalogs boundary conditions, error handling, and edge cases across the Fleet Dispatch system. Each entry describes a specific scenario and how the system handles it.

## Authentication Edge Cases

### Empty credentials
When a user submits an empty email or empty password, the ValidationPipe rejects the request with 400 Bad Request before reaching the auth service.

### Non-existent email
When login is attempted with an email that does not exist in the database, the auth service returns 401 Unauthorized without revealing whether the email exists.

### Invalid JWT token
When a malformed or expired JWT is presented, the JwtAuthGuard returns 401 Unauthorized. The error response includes a correlationId for debugging.

### Duplicate email registration
When a user attempts to register with an email that already exists, the service returns 409 Conflict to prevent duplicate accounts.

## Data Boundary Edge Cases

### Pagination beyond available data
When page number exceeds total pages, the list endpoint returns an empty data array with correct total count and page metadata (no crash).

### Pagination limit exceeds MAX_PAGE_SIZE
When limit parameter exceeds MAX_PAGE_SIZE (100), clampPagination reduces it to MAX_PAGE_SIZE silently without error.

### Negative page number
When page is 0 or negative, PaginatedQueryDto validation rejects with 400 Bad Request due to @Min(1) constraint.

### Empty tenant data
When a tenant has no vehicles/drivers/routes/dispatches, list endpoints return { data: [], total: 0 } rather than 404 or null.

## Security Edge Cases

### Cross-tenant access attempt
When a user attempts to access a resource belonging to a different tenant, the service returns 404 Not Found (not 403) to avoid revealing resource existence.

### Non-whitelisted request fields
When extra fields not defined in the DTO are included in the request body, forbidNonWhitelisted rejects with 400 Bad Request.

### SQL injection in string fields
When SQL injection payloads are submitted in string fields, Prisma's parameterized queries prevent execution. No $executeRawUnsafe is used anywhere.

### Rate limiting on auth endpoints
When more than 3 requests per second hit /auth/login or /auth/register, ThrottlerGuard returns 429 Too Many Requests.

## Infrastructure Edge Cases

### Missing environment variables
When DATABASE_URL, JWT_SECRET, or JWT_REFRESH_SECRET is missing or empty at startup, validateEnvVars throws immediately, preventing the app from starting in an unsafe state.

### Database connection failure
When the database is unreachable, GET /health/ready returns { database: 'disconnected', status: 'error' } instead of crashing.
