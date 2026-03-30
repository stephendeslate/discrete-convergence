# Authentication Specification

## Overview

Fleet Dispatch uses JWT-based authentication with bcryptjs for password hashing. Login produces a signed JWT containing userId, email, role, and tenantId. Registration validates role against ALLOWED_REGISTRATION_ROLES from shared constants.

## Login Flow

1. Client sends POST /auth/login with email and password
2. AuthService looks up user by email using findFirst (single unique match expected)
3. Password verified via bcryptjs.compare
4. JWT signed with userId, email, role, tenantId; expires in 1 hour
5. Token returned in response body

<!-- VERIFY: FD-AUTH-001 — AuthService.login validates credentials and returns JWT -->
<!-- VERIFY: FD-AUTH-002 — AuthService uses bcryptjs with BCRYPT_SALT_ROUNDS from shared -->

## Registration Flow

1. Client sends POST /auth/register with email, password, name, role, tenantId
2. Role validated against ALLOWED_REGISTRATION_ROLES (VIEWER, DISPATCHER only)
3. Password hashed with bcryptjs at BCRYPT_SALT_ROUNDS
4. User created in database with provided tenantId
5. Duplicate email returns 409 Conflict

<!-- VERIFY: FD-AUTH-005 — RegisterDto validates role against ALLOWED_REGISTRATION_ROLES -->

## JWT Strategy

The JwtStrategy extracts and validates tokens from the Authorization: Bearer header. The strategy uses JWT_SECRET from environment variables to verify token signatures.

<!-- VERIFY: FD-AUTH-003 — JwtStrategy validates token using JWT_SECRET -->

## Controller Configuration

Both login and register endpoints are decorated with @Public() (exempt from JWT guard) and @Throttle({ short: { ttl: 1000, limit: 3 } }) for rate limiting.

<!-- VERIFY: FD-AUTH-004 — AuthController applies @Public and @Throttle to auth endpoints -->
