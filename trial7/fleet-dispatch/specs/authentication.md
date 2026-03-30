# Authentication Specification

## Overview

Fleet Dispatch uses JWT-based authentication with bcrypt password hashing.
Users register with email, password, name, tenant, and role. ADMIN role
is excluded from self-registration (see [security.md](security.md)).

## Registration

- VERIFY: FD-AUTH-001 — Registration DTO validates email, password, name, tenantId, role
- VERIFY: FD-AUTH-002 — Login DTO validates email and password fields
- VERIFY: FD-AUTH-003 — Bcrypt salt rounds imported from shared constants (12 rounds)
- VERIFY: FD-AUTH-004 — ALLOWED_REGISTRATION_ROLES excludes ADMIN role

## Login Flow

- VERIFY: FD-AUTH-005 — AuthService handles registration and login with JWT token generation
- VERIFY: FD-AUTH-006 — AuthController exposes /auth/register and /auth/login with @Public()
- VERIFY: FD-AUTH-007 — JwtStrategy validates JWT payload and extracts user context

## Auth Module

- VERIFY: FD-AUTH-008 — AuthModule configures PassportModule and JwtModule with secret from env

## JWT Token Payload

The JWT token contains:
- `sub` — User ID
- `email` — User email address
- `role` — User role (ADMIN, DISPATCHER, DRIVER, VIEWER)
- `tenantId` — Tenant ID for multi-tenant isolation

## Password Security

- Passwords are hashed using bcrypt with 12 salt rounds
- Salt rounds constant is shared via `@fleet-dispatch/shared`
- No plaintext passwords are stored or logged
- See [security.md](security.md) for sanitization rules

## Token Expiration

- Tokens expire after 24 hours
- No refresh token mechanism in current version
- Expired tokens return 401 Unauthorized

## Error Handling

- Invalid credentials return 401 with generic "Invalid credentials" message
- Missing required fields return 400 with validation error details
- Registration with ADMIN role returns 400 validation error

## Multi-Tenant Context

- All authenticated requests include tenantId in JWT payload
- Services filter data by tenantId from JWT context
- Cross-tenant access is prevented at the service layer
