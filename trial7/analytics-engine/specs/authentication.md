# Authentication Specification

## Overview

The Analytics Engine uses JWT-based authentication with bcrypt password hashing.
Users authenticate via email/password and receive a JWT access token.
See also: [security.md](security.md) for authorization and [api-endpoints.md](api-endpoints.md) for endpoint details.

## Registration

New users register by providing email, password, name, tenantId, and role.
The role must be one of ALLOWED_REGISTRATION_ROLES (USER or VIEWER). ADMIN is excluded.

- VERIFY: AE-AUTH-001 — RegisterDto validates email, password, name, tenantId, and role with class-validator decorators
- VERIFY: AE-AUTH-002 — LoginDto validates email and password with class-validator decorators

## Authentication Service

The AuthService handles user registration and login logic:
- Registration checks for existing email via findFirst, hashes password with BCRYPT_SALT_ROUNDS, creates user, returns JWT
- Login verifies credentials via findFirst with tenant include, compares password hash, returns JWT
- Token payload includes sub (userId), email, role, tenantId

- VERIFY: AE-AUTH-003 — AuthService implements register and login with Prisma and bcrypt
- VERIFY: AE-AUTH-004 — JwtStrategy validates JWT payload and retrieves user from database

## JWT Guard

The JwtAuthGuard extends Passport AuthGuard and is registered as a global APP_GUARD.
It checks for @Public() decorator to skip authentication on designated routes.

- VERIFY: AE-AUTH-005 — JwtAuthGuard is registered globally and respects @Public() decorator
- VERIFY: AE-AUTH-006 — AuthController exposes register, login, and profile endpoints
- VERIFY: AE-AUTH-007 — AuthModule configures JWT with secret and expiration

## Token Flow

1. User submits credentials to POST /auth/login
2. AuthService validates credentials and returns JWT
3. Client includes JWT in Authorization header for subsequent requests
4. JwtAuthGuard extracts and validates token on every request
5. JwtStrategy calls validateUser to ensure user still exists
6. User object is attached to request for downstream use

## Password Security

- Bcrypt with BCRYPT_SALT_ROUNDS (12) from shared package
- Password is never stored in plaintext
- Password hash is never returned in API responses
- Salt rounds constant imported from @analytics-engine/shared

## Session Management

- JWTs expire after 24 hours
- No refresh token mechanism (single access token pattern)
- Client must re-authenticate after expiration
- Token contains tenantId for multi-tenant data isolation
