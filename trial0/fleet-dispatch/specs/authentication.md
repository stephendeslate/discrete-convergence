# Authentication Specification

## Overview

FleetDispatch uses JWT-based authentication with bcrypt password hashing.
Registration creates a new company and admin user. Login returns an access token.

## Registration

- VERIFY:FD-DTO-001 — RegisterDto validates email, password (min 8), name, companyName, role
- Role must be in ALLOWED_REGISTRATION_ROLES from shared constants
- Creates Company first, then User with hashed password
- Returns JWT access token on success

## Login

- VERIFY:FD-AUTH-002 — Login validates email exists and password matches via bcrypt.compare
- Returns { access_token } on success
- Returns 401 Unauthorized on invalid credentials

## JWT Strategy

- VERIFY:FD-AUTH-004 — JwtStrategy extracts sub and companyId from JWT payload
- Token signed with JWT_SECRET from environment
- Payload contains { sub: userId, companyId }

## Guards

- VERIFY:FD-GUARD-001 — APP_GUARD provides ThrottlerGuard globally
- VERIFY:FD-GUARD-002 — APP_GUARD provides JwtAuthGuard globally
- VERIFY:FD-AUTH-001 — @Public() decorator exempts routes from JWT guard
- VERIFY:FD-AUTH-005 — JwtAuthGuard checks for @Public metadata before requiring auth
- Registration and login endpoints are @Public
- Tracking endpoint is @Public (token-based auth instead)

## Password Security

- VERIFY:FD-AUTH-003 — Passwords hashed with bcrypt using BCRYPT_SALT_ROUNDS from shared
- Salt rounds set to 12 for production security
- Raw passwords never stored or logged

## Token Structure

```typescript
interface JwtPayload {
  sub: string;      // User ID
  companyId: string; // Tenant ID for RLS
}
```

## Cross-References

- See [Data Model](./data-model.md) for User and Company schemas
- See [Security](./security.md) for rate limiting and CORS configuration
- See [API Endpoints](./api-endpoints.md) for auth endpoint specifications
- See [Monitoring](./monitoring.md) for auth failure logging

## Convention Gates

- No `as any` casts in auth code
- No `console.log` — use structured logger
- No `|| 'value'` fallbacks for secrets — use validateEnvVars
- VERIFY:FD-CONST-001 — BCRYPT_SALT_ROUNDS and ALLOWED_REGISTRATION_ROLES from shared
- VERIFY:FD-TEST-001 — Integration test verifies register → login → protected route flow
- VERIFY:FD-TEST-007 — Unit test covers auth service register/login methods
