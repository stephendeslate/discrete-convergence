# Auth Specification

## Overview

Authentication and authorization for the Event Management platform.
Users register with email/password and receive JWT access tokens.
Role-based access control (RBAC) restricts operations by role.

## Registration

- Users register via POST /auth/register
- Email must be unique across the system
- Password is hashed with bcryptjs using BCRYPT_SALT_ROUNDS from shared constants
- Only roles in ALLOWED_REGISTRATION_ROLES can self-register
- VERIFY: EM-AUTH-001 — Password hashing uses bcryptjs with shared salt rounds
- VERIFY: EM-AUTH-002 — Registration checks for existing email before insert
- VERIFY: EM-AUTH-003 — RegisterDto validates email format, string types, and allowed roles
- VERIFY: EM-AUTH-004 — Auth service uses bcryptjs (not bcrypt native)

## Login

- Users authenticate via POST /auth/login
- Credentials verified against stored bcrypt hash
- Returns JWT access_token on success
- Returns 401 Unauthorized on invalid credentials
- VERIFY: EM-AUTH-005 — Auth controller applies @Throttle with limit:3 on login and register

## JWT Configuration

- Access tokens expire after 1 hour
- JWT secret loaded from environment variable JWT_SECRET
- Refresh secret loaded from JWT_REFRESH_SECRET
- VERIFY: EM-AUTH-006 — JwtModule configured with signOptions expiresIn:'1h'

## Token Validation

- JwtStrategy extracts token from Authorization Bearer header
- Payload contains sub (userId), email, role, tenantId
- Invalid or expired tokens return 401

## Rate Limiting

- Login and register endpoints have tight rate limits (3 requests per second)
- This prevents brute-force password attacks
- Global throttle allows 100 requests per second for normal operations

## Security Constraints

- Passwords must not appear in logs or API responses
- Email uniqueness enforced at application level (findFirst + create)
- Registration role restricted to VIEWER only via DTO validation
