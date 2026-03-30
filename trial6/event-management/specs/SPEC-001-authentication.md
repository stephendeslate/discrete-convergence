# SPEC-001: Authentication

**Status:** APPROVED
**Priority:** P0
**Cross-References:** SPEC-006 (Multi-Tenancy), SPEC-008 (Security), SPEC-009 (API Conventions)

## Overview

JWT-based authentication with bcrypt password hashing, role-restricted registration,
and cookie-based session management for the frontend.

## Requirements

### VERIFY:EM-AUTH-001 — Bcrypt Salt Rounds
BCRYPT_SALT_ROUNDS is a shared constant (12) used consistently across AuthService and seed.

### VERIFY:EM-AUTH-002 — Registration Role Restriction
ALLOWED_REGISTRATION_ROLES excludes ADMIN. Only ORGANIZER and VIEWER can self-register.
ADMIN accounts are created via seed or direct database operations.

### VERIFY:EM-AUTH-003 — Public Decorator
@Public() decorator sets IS_PUBLIC_KEY metadata to bypass JwtAuthGuard for login, register,
and health/monitoring endpoints.

### VERIFY:EM-AUTH-004 — Auth Service
AuthService handles register and login flows:
- Register: validate role, check email uniqueness, hash password, create user, generate JWT
- Login: lookup by email, verify password with bcrypt.compare, generate JWT
- Returns AuthResponse with accessToken and user profile (id, email, name, role, tenantId)

### VERIFY:EM-AUTH-005 — Auth Controller
AuthController exposes POST /auth/register and POST /auth/login, both marked @Public().

### VERIFY:EM-AUTH-006 — JWT Strategy
JwtStrategy extracts Bearer token from Authorization header, validates expiration,
maps payload to user object with id, email, role, tenantId.

### VERIFY:EM-AUTH-007 — JWT Auth Guard
JwtAuthGuard registered as APP_GUARD via dependency injection. Respects @Public() metadata
to skip authentication for public endpoints.

## Verification Criteria

1. `bcrypt` salt rounds must equal the shared constant (12) — no magic numbers
2. Registration rejects ADMIN role with 403
3. Login returns 401 for invalid credentials (email not found or wrong password)
4. JWT token contains sub, email, role, tenantId in payload
5. @Public() endpoints are accessible without Authorization header
6. Protected endpoints return 401 without valid Bearer token
7. Token expiration is enforced (expired tokens rejected)

## Token Format

JWT payload:
- sub: user UUID
- email: user email address
- role: ADMIN | ORGANIZER | VIEWER
- tenantId: tenant UUID for multi-tenant scoping

Token expiration: 15 minutes.

## Frontend Integration

1. Login response sets JWT in httpOnly cookie via server action
2. getToken() in lib/actions.ts reads cookie for API calls
3. middleware.ts checks cookie presence, redirects to /login if absent
4. All API calls include Authorization: Bearer {token} header
