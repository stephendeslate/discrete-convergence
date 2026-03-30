# Authentication Specification

## Overview
Fleet Dispatch uses JWT-based authentication with refresh tokens for session management.
Multi-tenant isolation is enforced via tenant ID in JWT payload.

## Authentication Flow
1. User submits email/password to POST /auth/login
2. Server validates credentials using bcryptjs
3. On success, returns access_token (1h) and refresh_token (7d)
4. Frontend stores token in httpOnly cookie
5. All subsequent requests include Authorization: Bearer header

## Registration Flow
1. New user submits registration form to POST /auth/register
2. Only ADMIN and DISPATCHER roles allowed for self-registration
3. A new Company (tenant) is created automatically
4. User is assigned to the new company with tenantId = companyId
5. Tokens are returned immediately (auto-login)

## Token Refresh
1. Client sends refresh_token to POST /auth/refresh
2. Server verifies using JWT_REFRESH_SECRET
3. New token pair is returned
4. Old refresh token is invalidated on rotation

## Token Expiry Validation
- Access tokens expire after 1 hour (configurable via JWT_EXPIRY) — VERIFY: FD-AUTH-004
- Refresh tokens expire after 7 days — VERIFY: FD-AUTH-005
- Expired access tokens return 401 Unauthorized
- Expired refresh tokens require full re-authentication

## Invalid Credentials Handling
- Unknown email returns generic "Invalid credentials" (no user enumeration) — VERIFY: FD-AUTH-006
- Wrong password returns same generic "Invalid credentials" message
- No distinction between missing user and wrong password in error response

## Role-Based Access Control
- ADMIN: full access to all endpoints and resources
- DISPATCHER: can manage work orders, technicians, customers, routes
- TECHNICIAN: can update own work order status and GPS location
- CUSTOMER: read-only access to own work orders via magic link
- RolesGuard enforced as APP_GUARD on all routes — VERIFY: FD-SEC-005

## Password Hashing
- bcryptjs with 12 salt rounds (BCRYPT_SALT_ROUNDS constant) — VERIFY: FD-AUTH-007
- Password hashing occurs during registration only
- Raw passwords never stored or logged

## Rate Limiting on Auth Endpoints
- Login endpoint: @Throttle({short:{ttl:1000,limit:10}}) — VERIFY: FD-AUTH-008
- Register endpoint: @Throttle({short:{ttl:1000,limit:10}})
- Refresh endpoint uses default rate limits
- Exceeding limit returns 429 Too Many Requests

## Security Measures
- Passwords hashed with bcryptjs (12 salt rounds) — VERIFY: FD-SEC-001
- JWT secret via environment variable, never hardcoded — VERIFY: FD-SEC-003
- Global JwtAuthGuard as APP_GUARD — VERIFY: FD-SEC-004
- Rate limiting on auth endpoints: 10 requests per second — VERIFY: FD-AUTH-003
- Registration restricted to allowed roles — VERIFY: FD-AUTH-002

## VERIFY Tags
- FD-AUTH-001: AuthService handles login, registration, refresh
- FD-AUTH-002: Registration restricted to ALLOWED_REGISTRATION_ROLES
- FD-AUTH-003: Auth controller with rate-limited endpoints
- FD-AUTH-004: Access token expiry of 1 hour
- FD-AUTH-005: Refresh token expiry of 7 days
- FD-AUTH-006: Generic error for invalid credentials (no user enumeration)
- FD-AUTH-007: bcryptjs with 12 salt rounds for password hashing
- FD-AUTH-008: Rate limiting on login and register endpoints

## Cross-References
- See [security.md](security.md) for global security configuration
- See [api-endpoints.md](api-endpoints.md) for full endpoint listing
- See [data-model.md](data-model.md) for User entity schema
