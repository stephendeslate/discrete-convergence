# Authentication Specification

## Overview

The Event Management Platform uses JWT-based authentication with bcryptjs
password hashing. Users register with an email, password, role, and tenant ID.
Login returns an access token and refresh token.

## Registration

VERIFY: EM-AUTH-001 — Registration DTO restricts role to ALLOWED_REGISTRATION_ROLES
VERIFY: EM-AUTH-003 — Shared constants define BCRYPT_SALT_ROUNDS for consistent hashing
VERIFY: EM-AUTH-004 — Shared constants define ALLOWED_REGISTRATION_ROLES array

New users register via POST /auth/register. The registration DTO validates:
- email: must be a valid email address
- password: required string, minimum length enforced
- role: must be in the ALLOWED_REGISTRATION_ROLES constant from shared package
- tenantId: required string identifying the tenant

The role restriction prevents users from self-assigning ADMIN privileges.
Only VIEWER is currently allowed for self-registration.

See: data-model.md for User entity schema
See: security.md for input validation rules

## Login

VERIFY: EM-AUTH-002 — Auth service uses bcryptjs for password comparison

Login via POST /auth/login accepts email and password. The service:
1. Looks up the user by email (findFirst with email filter)
2. Compares the provided password against the stored bcrypt hash
3. Returns accessToken (1h expiry) and refreshToken on success
4. Returns 401 on invalid credentials

The login endpoint uses findFirst deliberately — email is unique per tenant,
but the query needs to handle the case where no user exists gracefully.

## JWT Strategy

VERIFY: EM-AUTH-005 — Auth controller applies @Throttle on login and register

The JWT strategy extracts the token from the Authorization Bearer header.
It validates using the JWT_SECRET environment variable and extracts:
- sub: user ID
- email: user email
- role: user role (ADMIN, EDITOR, VIEWER)
- tenantId: tenant identifier for multi-tenancy

VERIFY: EM-AUTH-006 — JWT strategy reads secret from process.env.JWT_SECRET

Rate limiting is applied to auth endpoints to prevent brute-force attacks.
The @Throttle decorator limits login and register to 10 requests per second.

See: security.md for rate limiting configuration
See: monitoring.md for request logging

## Token Refresh

Refresh tokens use a separate JWT_REFRESH_SECRET. The refresh flow:
1. Client sends refresh token to POST /auth/refresh
2. Server validates the refresh token
3. Returns a new access token

## Session Management

The frontend stores tokens in httpOnly cookies via server actions.
This prevents XSS attacks from accessing the token directly.

See: frontend.md for cookie-based token storage

## Multi-Tenant Authentication

Every authenticated request carries the tenantId in the JWT payload.
All data queries are scoped by tenantId to enforce tenant isolation.
This is enforced at the service layer, not just the database layer.

See: cross-layer.md for tenant isolation verification
See: data-model.md for RLS policies
