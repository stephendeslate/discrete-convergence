# Authentication Specification

> **Project:** Event Management
> **Domain:** AUTH
> **VERIFY Tags:** EM-AUTH-001 – EM-AUTH-005

---

## Overview

JWT-based authentication with bcryptjs password hashing. Access tokens (15m) and
refresh tokens (7d) are issued on login. Registration is self-service but
restricted to non-ADMIN roles. Rate limiting protects login and registration
endpoints from brute-force attacks.

---

## Requirements

### EM-AUTH-001: JWT Login with bcryptjs

<!-- VERIFY: EM-AUTH-001 -->

- Users authenticate via POST /auth/login with email and password.
- Passwords are compared using `bcryptjs.compare()`.
- Salt rounds are sourced from `BCRYPT_SALT_ROUNDS` exported by `@repo/shared`.
- On success, returns `access_token` (15m expiry) and `refresh_token` (7d expiry).
- On failure, returns 401 Unauthorized with generic message.

### EM-AUTH-002: Registration Role Restriction

<!-- VERIFY: EM-AUTH-002 -->

- Self-registration via POST /auth/register.
- Allowed roles are defined by `ALLOWED_REGISTRATION_ROLES` from `@repo/shared`.
- ADMIN role is explicitly excluded from self-registration.
- Registration creates a new User record with the specified role.

### EM-AUTH-003: Refresh Token Validation

<!-- VERIFY: EM-AUTH-003 -->

- POST /auth/refresh accepts a refresh token.
- Validates the refresh token using `JWT_REFRESH_SECRET`.
- On success, issues a new access_token and refresh_token pair.
- On failure, returns 401 Unauthorized.

### EM-AUTH-004: Global JwtAuthGuard

<!-- VERIFY: EM-AUTH-004 -->

- `JwtAuthGuard` is registered as `APP_GUARD` in AppModule.
- All routes require valid JWT by default.
- Routes decorated with `@Public()` bypass the guard.
- Invalid or missing tokens result in 401 Unauthorized.

### EM-AUTH-005: Login Rate Limiting

<!-- VERIFY: EM-AUTH-005 -->

- Login endpoint is decorated with `@Throttle()` for rate limiting.
- Registration endpoint also has throttle protection.
- ThrottlerModule is configured globally with `short.limit >= 20000`.
