# Authentication Specification

## Overview

The Analytics Engine uses JWT-based authentication with access and refresh tokens.
Users authenticate via email/password, receiving a short-lived access token (1h) and
a refresh token for session continuity. Registration is restricted to the VIEWER role
via ALLOWED_REGISTRATION_ROLES from the shared package. ADMIN accounts are created
only via database seeding.

See also: security.md for token storage and transport security requirements.
See also: api-endpoints.md for the full auth endpoint contract.

## Authentication Flow

1. User submits email and password to POST /auth/register or POST /auth/login
2. Server validates input using class-validator decorators (whitelist + forbidNonWhitelisted)
3. Passwords are hashed with bcryptjs using BCRYPT_SALT_ROUNDS (12) from shared constants
4. On successful login, server returns { accessToken, refreshToken }
5. Client stores tokens in httpOnly cookies via server actions
6. Subsequent requests include Authorization: Bearer <token> header
7. JwtAuthGuard validates the token on protected routes
8. Routes decorated with @Public() bypass JWT validation

VERIFY: AE-AUTH-001 — JWT tokens issued on successful login with access and refresh tokens
VERIFY: AE-AUTH-002 — Password hashing uses bcryptjs with configurable salt rounds from shared constants
VERIFY: AE-AUTH-003 — Registration restricted to VIEWER role only via ALLOWED_REGISTRATION_ROLES
VERIFY: AE-AUTH-004 — Login endpoint returns 401 for invalid credentials without leaking user existence
VERIFY: AE-AUTH-005 — JwtAuthGuard enforces authentication on all non-public routes
VERIFY: AE-AUTH-006 — Rate limiting applied to login and register endpoints via @Throttle decorator
VERIFY: AE-AUTH-007 — Registration returns 409 Conflict when email already exists

## Token Configuration

- Access token expiry: 1 hour (configurable via JWT_SECRET env var)
- Refresh token uses separate JWT_REFRESH_SECRET
- Token extraction: fromAuthHeaderAsBearerToken strategy
- Token payload contains: sub (userId), email, role, tenantId

## Password Requirements

- Minimum length enforced by @MaxLength and @MinLength on DTO
- Hashing algorithm: bcryptjs (chosen over bcrypt to avoid native dependency)
- Salt rounds: 12 (from BCRYPT_SALT_ROUNDS shared constant)

## Guard Chain

The application uses a layered guard approach:
1. ThrottlerGuard (APP_GUARD) - rate limiting
2. JwtAuthGuard (APP_GUARD) - authentication check
3. RolesGuard (APP_GUARD) - authorization check

Each guard respects the @Public() decorator to skip authentication
where appropriate (health endpoints, metrics, auth endpoints).

## Error Handling

- Invalid credentials: 401 Unauthorized
- Duplicate email: 409 Conflict
- Validation failure: 400 Bad Request with field-level errors
- Missing token: 401 Unauthorized
- Expired token: 401 Unauthorized
- Insufficient role: 403 Forbidden
