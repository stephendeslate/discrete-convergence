# Authentication Specification

## Overview

The Event Management platform uses JWT-based authentication with access and refresh tokens.
All protected endpoints require a valid JWT token in the Authorization header.
Authentication integrates with the security controls described in [security.md](security.md).
Password hashing and user data are managed via the data model in [data-model.md](data-model.md).

## Requirements

### EM-AUTH-001 — User Registration
Users can register with email and password. Passwords are hashed using bcryptjs with configurable salt rounds.
The system must reject duplicate email addresses with a 409 Conflict response.
Registration returns both access and refresh tokens.
<!-- VERIFY:EM-AUTH-001 — Registration creates user with hashed password and returns tokens -->

### EM-AUTH-002 — User Login
Users authenticate with email and password. On success, the system returns access and refresh tokens.
Invalid credentials must return 401 Unauthorized without revealing which field is incorrect.
Login creates an audit log entry with LOGIN action.
<!-- VERIFY:EM-AUTH-002 — Login validates credentials and returns JWT token pair -->

### EM-AUTH-003 — Token Refresh
Clients can exchange a valid refresh token for a new access/refresh token pair.
Expired or invalid refresh tokens must return 401 Unauthorized.
Uses JWT_REFRESH_SECRET for refresh token verification.
<!-- VERIFY:EM-AUTH-003 — Token refresh issues new token pair from valid refresh token -->

### EM-AUTH-004 — JWT Payload
JWT tokens must contain: sub (user ID), email, tenantId, and role claims.
Access tokens expire in 15 minutes; refresh tokens expire in 7 days.
Token expiry constants defined in shared package.
<!-- VERIFY:EM-AUTH-004 — JWT payload contains required claims with correct expiry -->

### EM-AUTH-005 — Password Requirements
Passwords must be at least 8 characters and at most 128 characters.
Password validation uses class-validator decorators with @MinLength and @MaxLength.
<!-- VERIFY:EM-AUTH-005 — Password validation enforces minimum and maximum length -->

### EM-AUTH-006 — Auth Guard
A global JWT auth guard protects all endpoints by default.
Public endpoints (health, auth) bypass the guard via @UseGuards or lack thereof.
<!-- VERIFY:EM-AUTH-006 — Global auth guard blocks unauthenticated requests to protected endpoints -->

### EM-AUTH-007 — Rate Limiting on Login
The login endpoint has stricter rate limiting (10 requests per 60 seconds) to prevent brute force attacks.
Configured via @Throttle decorator with LOGIN_RATE_LIMIT config.
<!-- VERIFY:EM-AUTH-007 — Login endpoint applies stricter rate limiting than default -->

### EM-AUTH-008 — Input Validation
All auth DTOs use class-validator decorators including @MaxLength on string fields.
UUID fields use @MaxLength(36) constraint.
The ValidationPipe has forbidNonWhitelisted: true to reject unknown fields.
<!-- VERIFY:EM-AUTH-008 — edge case: malformed or invalid auth input returns 400 error -->

## Error Handling

- 400 Bad Request: Invalid input (missing/invalid email, short password, unknown fields)
- 401 Unauthorized: Invalid credentials, expired token, invalid refresh token
- 409 Conflict: Duplicate email registration attempt
