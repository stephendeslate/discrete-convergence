# Edge Cases Specification

## Overview

This document catalogs boundary conditions, error handling scenarios, and edge
cases that the Fleet Dispatch platform handles. These are verified through
dedicated edge case integration tests.

## Pagination Edge Cases

### Empty Results
- Empty collection returns valid paginated structure
- data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 }

### Boundary Values
- page=0 should be clamped to 1 or rejected
- pageSize=0 should be clamped to DEFAULT_PAGE_SIZE or rejected
- pageSize > MAX_PAGE_SIZE (100) should be clamped to MAX_PAGE_SIZE
- Very large page numbers return empty data array with correct meta

### Invalid Input
- Non-numeric page value: rejected by ValidationPipe
- Negative page value: rejected by validation

## Authentication Edge Cases

### Invalid Tokens
- Expired JWT: returns 401 Unauthorized
- Malformed JWT: returns 401 Unauthorized
- Missing Authorization header: returns 401 Unauthorized
- Invalid Bearer format: returns 401 Unauthorized

### Registration
- Duplicate email: returns 409 Conflict
- Missing required fields: returns 400 Bad Request
- Invalid email format: returns 400 Bad Request
- Password too short: returns 400 Bad Request

## Validation Edge Cases

### UUID Format
- Invalid UUID format in path params: rejected with 400
- UUID exceeding 36 characters: rejected by @MaxLength(36)
- Empty UUID string: rejected by @IsString

### String Fields
- XSS payloads in string fields: rejected by @MaxLength and sanitization
- SQL injection in string fields: parameterized by Prisma
- Very long strings: rejected by @MaxLength decorators
- Empty strings on required fields: rejected by @IsString

### Extra Properties
- Unknown properties in request body: rejected by forbidNonWhitelisted
- This prevents mass assignment vulnerabilities

## Business Logic Edge Cases

### Dispatch Creation
- Vehicle not found: 404
- Vehicle not ACTIVE: 400 with descriptive message
- Vehicle already has active dispatch: 400
- Driver not found: 404
- Driver not AVAILABLE: 400 with descriptive message
- Route not found: 404

### Dispatch State Transitions
- Assign already ASSIGNED: 400
- Assign non-PENDING: 400
- Complete already COMPLETED: 400
- Complete CANCELLED: 400
- Complete PENDING (not yet assigned): 400
- Cancel already CANCELLED: 400
- Cancel COMPLETED: 400

### Driver Deletion
- Delete ON_DUTY driver: 400
- Delete driver with active dispatches: 400

### Vehicle Deactivation
- Deactivate with active dispatches: 400
- Activate vehicle in MAINTENANCE: 400

### Maintenance Completion
- Complete already completed: 400
- Complete cancelled: 400
- Update completed maintenance: 400
- Update cancelled maintenance: 400

### Trip Creation
- Create for cancelled dispatch: 400
- Create for completed dispatch: 400
- Complete already completed trip: 400
- Complete cancelled trip: 400
