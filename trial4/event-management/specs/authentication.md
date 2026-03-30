# Authentication Specification

## Overview

The Event Management platform uses JWT-based authentication with bcrypt password
hashing. Users authenticate via email + password and receive access/refresh tokens.
Role-based access control enforces ADMIN, ORGANIZER, and ATTENDEE permissions.

See [security.md](security.md) for rate limiting and input validation details.

## Requirements

### VERIFY:EM-AUTH-001 — Bcrypt Salt Rounds from Shared
Password hashing uses bcrypt with `BCRYPT_SALT_ROUNDS` imported from
`@event-management/shared`. The salt rounds constant (12) is never hardcoded
in service files or seed scripts.

### VERIFY:EM-AUTH-002 — Registration Role Whitelist
User registration enforces `@IsIn(ALLOWED_REGISTRATION_ROLES)` on the role field.
The `ALLOWED_REGISTRATION_ROLES` constant is imported from shared and excludes
ADMIN to prevent privilege escalation via self-registration.

### VERIFY:EM-AUTH-003 — Auth Endpoints with @Public
Auth endpoints (login, register, refresh) are decorated with `@Public()` to
exempt them from the global JwtAuthGuard. This ensures unauthenticated users
can access authentication flows.

### VERIFY:EM-AUTH-004 — Auth Service with JWT + Bcrypt
The AuthService handles login (password comparison), registration (hash + create),
and refresh (token verification + re-signing). It uses JwtService for token
operations and bcrypt for password hashing with shared salt rounds.

### VERIFY:EM-AUTH-005 — Registration DTO Validation
The RegisterDto validates all fields with class-validator decorators:
- email: `@IsEmail()` + `@IsString()` + `@MaxLength(255)`
- password: `@IsString()` + `@MaxLength(128)`
- firstName/lastName: `@IsString()` + `@MaxLength(100)`
- role: `@IsIn(ALLOWED_REGISTRATION_ROLES)` from shared
- organizationId: `@IsString()` + `@MaxLength(36)`

## Token Structure

Access tokens contain: sub (userId), email, role, organizationId.
Access tokens expire in 1 hour. Refresh tokens expire in 7 days.

## Password Security

- bcrypt with 12 salt rounds (from shared constant)
- Passwords stored as hashes, never in plaintext
- Login returns generic "Invalid credentials" for both wrong email and wrong password

## Error Handling

- Invalid credentials: 401 Unauthorized
- Duplicate email in same org: 409 Conflict
- Invalid registration role: 409 Conflict
- Invalid refresh token: 401 Unauthorized
