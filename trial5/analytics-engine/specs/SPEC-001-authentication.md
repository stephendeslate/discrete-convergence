# SPEC-001: Authentication

> **Status:** APPROVED
> **Priority:** P0
> **Cross-references:** SPEC-006 (multi-tenancy), SPEC-008 (security)

## Overview

The Analytics Engine uses JWT-based authentication with bcrypt password hashing.
Users authenticate via email/password and receive an access token (15m TTL) and
a refresh token (7d TTL). The JWT payload includes the user's tenant ID for
multi-tenant isolation (see SPEC-006).

## Requirements

### Registration
<!-- VERIFY: auth-register -->
- POST /auth/register accepts email, password, role, tenantId
- Password is hashed with bcrypt using BCRYPT_SALT_ROUNDS (12) from shared constants
- Only USER and VIEWER roles are allowed for self-registration (ALLOWED_REGISTRATION_ROLES)
- Returns { id, email, role } on success
- Validation: email format, password min 8 chars, role in allowed set

### Login
<!-- VERIFY: auth-login -->
- POST /auth/login accepts email and password
- Looks up user by email using findFirst (email is not unique across tenants)
- Compares password hash with bcrypt.compare
- Returns { accessToken, refreshToken } on success
- Returns 401 Unauthorized for invalid credentials
- JWT payload contains: sub (userId), email, role, tenantId

### Token Refresh
<!-- VERIFY: auth-refresh -->
- POST /auth/refresh accepts refreshToken in body
- Verifies the refresh token signature
- Issues new accessToken and refreshToken pair
- Returns 401 if refresh token is expired or invalid

### JWT Strategy
<!-- VERIFY: auth-jwt-strategy -->
- Extracts token from Authorization: Bearer header
- Validates token against JWT_SECRET environment variable
- Populates req.user with { userId, email, role, tenantId }
- Token expiration is enforced (ignoreExpiration: false)

### Guards
<!-- VERIFY: auth-guards -->
- JwtAuthGuard is applied globally via APP_GUARD
- Routes decorated with @Public() bypass JWT authentication
- RolesGuard checks req.user.role against @Roles() decorator values

## Frontend Integration
<!-- VERIFY: auth-frontend -->
- Login form posts to POST /auth/login
- Token stored in HTTP-only cookie via server action
- Protected pages redirect to /login via Next.js middleware when no token
- All API calls include Authorization: Bearer <token> header
- getToken() helper in lib/actions.ts retrieves stored token from cookies

## Security Considerations
- See SPEC-008 for password complexity, rate limiting, and input validation
- JWT_SECRET must be set via environment variable (validated at bootstrap)
- Refresh tokens share the same secret but have longer expiry
