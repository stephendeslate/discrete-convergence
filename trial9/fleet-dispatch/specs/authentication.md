# Authentication Specification

## Overview

Fleet Dispatch uses JWT-based authentication with bcryptjs password hashing.
All non-public endpoints require a valid JWT token in the Authorization header.
Registration is restricted to allowed roles defined in the shared constants package.

## Constants

<!-- VERIFY: FD-AUTH-001 -->
- `BCRYPT_SALT_ROUNDS` is set to 12, imported from `@fleet-dispatch/shared`

<!-- VERIFY: FD-AUTH-002 -->
- `ALLOWED_REGISTRATION_ROLES` restricts which roles can self-register

## Authentication Flow

### Registration

<!-- VERIFY: FD-AUTH-005 -->
Users register via `POST /auth/register` with email, password, name, and role.
The RegisterDto validates input using class-validator decorators including
`@IsIn(ALLOWED_REGISTRATION_ROLES)` to restrict role selection.

<!-- VERIFY: FD-AUTH-006 -->
Login is performed via `POST /auth/login` with email and password.
The LoginDto validates that both fields are present strings.

### Token Issuance

<!-- VERIFY: FD-AUTH-007 -->
The AuthService handles registration and login logic:
- Registration: hashes password with bcryptjs using BCRYPT_SALT_ROUNDS
- Login: validates credentials with bcrypt.compare, returns signed JWT
- Uses `findFirst` for user lookup (justification: email is unique)

### JWT Strategy

<!-- VERIFY: FD-AUTH-009 -->
The JwtStrategy extracts tokens from the Authorization Bearer header.
It validates the token signature using the JWT_SECRET environment variable
and returns the payload containing userId, email, role, and tenantId.

### Auth Controller

<!-- VERIFY: FD-AUTH-008 -->
The AuthController exposes three endpoints:
- `POST /auth/register` — public, creates new user
- `POST /auth/login` — public, returns access_token
- `GET /auth/profile` — protected, returns current user info

### Auth Decorators

<!-- VERIFY: FD-AUTH-003 -->
Custom decorators defined in `auth-utils.ts`:
- `@Public()` marks endpoints that bypass JWT authentication
- `@Roles(...roles)` restricts access to specific user roles
- `@TenantId()` extracts tenantId from the JWT payload
- `RequestWithUser` interface extends Express Request with user payload

### JWT Auth Guard

<!-- VERIFY: FD-AUTH-004 -->
The JwtAuthGuard is registered as a global APP_GUARD.
It checks for the `@Public()` metadata and skips authentication
for endpoints decorated with `@Public()`. All other endpoints
require a valid JWT token.

## Integration Testing

<!-- VERIFY: FD-AUTH-010 -->
Auth integration tests verify the full authentication flow:
- User registration with valid and invalid data
- Login with correct and incorrect credentials
- Profile access with valid token
- Admin endpoint access control
- Expired token handling

## Cross-References

- See [security.md](security.md) for rate limiting on auth endpoints
- See [api-endpoints.md](api-endpoints.md) for full endpoint listing
