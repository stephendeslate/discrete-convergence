# Authentication Specification

## Overview

Fleet Dispatch uses JWT-based authentication with access and refresh token pairs.
Passwords are hashed using bcryptjs with a configurable salt rounds constant from
the shared package. Registration enforces allowed roles to prevent privilege escalation.

Cross-references: [security.md](security.md), [api-endpoints.md](api-endpoints.md)

## Authentication Flow

1. User submits credentials via POST /auth/login or POST /auth/register
2. Server validates input using class-validator DTOs with whitelist and forbidNonWhitelisted
3. For registration: email uniqueness checked via findFirst, password hashed with BCRYPT_SALT_ROUNDS
4. For login: password compared with bcrypt.compare against stored hash
5. JWT access token (1h expiry) and refresh token (7d expiry) generated
6. Frontend stores tokens in httpOnly secure cookies via server actions
7. Subsequent requests include Authorization: Bearer {token} header

## Registration Rules

- Email must be valid format (@IsEmail)
- Password required (@IsString, @MinLength(6))
- Role must be in ALLOWED_REGISTRATION_ROLES (VIEWER, DISPATCHER) — no ADMIN self-registration
- TenantId required (@IsString)
- Extra fields rejected (forbidNonWhitelisted: true)
- Duplicate email returns 409 Conflict

## Token Structure

JWT payload contains: sub (user ID), email, role, tenantId.
Access token signed with JWT_SECRET (1h expiry).
Refresh token signed with JWT_REFRESH_SECRET (7d expiry).

## Rate Limiting

Login and register endpoints use @Throttle({ short: { ttl: 1000, limit: 10 } })
to prevent brute-force attacks while allowing legitimate usage.

## Frontend Integration

- Login page (app/login/page.tsx) calls loginAction server action
- Server action POSTs to API, stores tokens in httpOnly cookies
- getAuthHeaders() reads token from cookies for subsequent API calls
- Logout clears both access_token and refresh_token cookies

Cross-references: [frontend.md](frontend.md), [security.md](security.md)

## VERIFY Tags

- VERIFY: FD-AUTH-001 — Login page renders with email and password fields
- VERIFY: FD-AUTH-002 — Registration page enforces allowed roles
- VERIFY: FD-AUTH-003 — Logout clears tokens from cookies
- VERIFY: FD-AUTH-004 — Input component supports accessible attributes
- VERIFY: FD-AUTH-005 — Auth service hashes passwords with bcryptjs
- VERIFY: FD-AUTH-006 — Auth controller applies rate limiting on login/register
- VERIFY: FD-AUTH-007 — Server actions include auth headers from cookies
- VERIFY: FD-AUTH-008 — Login action stores tokens in httpOnly cookies

## Error Handling

- Invalid credentials: 401 Unauthorized
- Duplicate email: 409 Conflict
- Invalid input: 400 Bad Request
- Expired token: 401 Unauthorized (handled by JwtAuthGuard via passport-jwt)
