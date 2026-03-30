# Authentication Specification

## Overview

The Analytics Engine uses JWT-based authentication with bcrypt password hashing.
All API endpoints (except health and auth) require a valid JWT token. Authentication
is enforced globally via APP_GUARD, not per-controller decorators.

See [security.md](security.md) for security-related configuration details.
See [api-endpoints.md](api-endpoints.md) for endpoint-level auth requirements.

## Authentication Flow

1. User submits email + password to POST /auth/login
2. Server validates credentials against bcrypt hash
3. On success, returns JWT containing: sub (userId), email, role, tenantId
4. Client includes JWT in Authorization header for subsequent requests
5. JwtAuthGuard (APP_GUARD) validates token on every request
6. @Public() decorator exempts specific routes from auth

## Requirements

### VERIFY:AE-SEC-001
Auth service MUST use BCRYPT_SALT_ROUNDS from @analytics-engine/shared for
password hashing. No hardcoded salt rounds allowed.

### VERIFY:AE-SEC-002
JWT strategy MUST NOT have a hardcoded secret fallback. The JWT_SECRET
environment variable must be required at startup.

### VERIFY:AE-SEC-003
Registration endpoint MUST restrict roles via ALLOWED_REGISTRATION_ROLES
from shared. ADMIN role MUST be excluded from self-registration.

### VERIFY:AE-SEC-004
JwtAuthGuard MUST be registered as APP_GUARD in AppModule providers.
Domain controllers MUST NOT use @UseGuards(JwtAuthGuard) directly.
The guard checks for @Public() metadata to exempt routes.

## Password Policy

- Minimum 8 characters enforced via DTO validation
- Bcrypt with 12 salt rounds (from shared constant)
- Password hash stored; plaintext never persisted or logged

## JWT Token Structure

```
{
  sub: string;      // user ID
  email: string;    // user email
  role: string;     // user role (ADMIN, USER, VIEWER)
  tenantId: string; // tenant isolation scope
  iat: number;      // issued at
  exp: number;      // expiration
}
```

## Registration Rules

- Only USER and VIEWER roles allowed for self-registration
- ADMIN accounts are created by existing admins only
- Email uniqueness enforced at database level
- Tenant ID required during registration

## Error Handling

- Invalid credentials: 401 Unauthorized (generic message)
- Missing/expired token: 401 Unauthorized
- Invalid email format: 400 Bad Request (from DTO validation)
- Duplicate email: 409 Conflict or DB constraint error
