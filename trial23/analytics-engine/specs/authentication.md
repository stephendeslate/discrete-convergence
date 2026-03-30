# Authentication Specification

> **Project:** Analytics Engine
> **Category:** AUTH
> **Related:** See [data-model.md](data-model.md) for User entity, see [security.md](security.md) for rate limiting on auth routes

---

## Overview

The analytics engine uses JWT-based authentication with bcrypt password hashing. Users register with email/password and receive a JWT access token and refresh token. Admin roles cannot be self-registered — they are assigned via database seeding or direct assignment. All auth operations are tenant-scoped.

---

## Requirements

### VERIFY: AE-AUTH-001 — JWT login with bcryptjs and BCRYPT_SALT_ROUNDS from shared

The auth service implements JWT-based authentication using `@nestjs/jwt` and `@nestjs/passport`. Passwords are hashed using bcryptjs with `BCRYPT_SALT_ROUNDS` imported from the shared package (`packages/shared/src/index.ts`). The salt rounds value must not be hardcoded in any service file — it must always reference the shared constant. The `AuthService.login()` method validates email/password credentials, verifies the password hash using `bcrypt.compare()`, and returns a signed JWT access token and refresh token. The JWT payload includes `sub` (userId), `email`, `role`, and `tenantId`. Access tokens expire after a configurable duration set via `JWT_EXPIRY` environment variable.

### VERIFY: AE-AUTH-002 — Registration validates ALLOWED_REGISTRATION_ROLES, ADMIN excluded

User registration accepts a `role` field validated against `ALLOWED_REGISTRATION_ROLES` imported from the shared package. The `ADMIN` role is explicitly excluded from self-registration. The registration DTO uses `@IsIn(ALLOWED_REGISTRATION_ROLES)` from class-validator to enforce this at the validation layer. Attempting to register with role `ADMIN` returns a 403 Forbidden response. Registration creates a new user record with the provided email, hashed password, role, and tenantId. Duplicate email registration returns 409 Conflict.

### VERIFY: AE-AUTH-003 — Refresh token endpoint validates and reissues tokens

The `POST /auth/refresh` endpoint accepts a refresh token in the request body, validates it against the stored token hash, and issues a new access token and refresh token pair. Old refresh tokens are invalidated upon successful rotation (single-use tokens). If the refresh token is expired or invalid, the endpoint returns 401 Unauthorized. The refresh token has a longer expiry than the access token, configured via `JWT_REFRESH_EXPIRY` environment variable.

### VERIFY: AE-AUTH-004 — Global JwtAuthGuard registered as APP_GUARD

`JwtAuthGuard` is registered as a global `APP_GUARD` in `AppModule.providers` using NestJS dependency injection. Domain controllers do NOT use `@UseGuards(JwtAuthGuard)` — the global guard protects all routes by default. Routes that need to bypass auth use the `@Public()` custom decorator backed by `SetMetadata`. The guard checks for the `IS_PUBLIC` metadata key and skips JWT validation when present. Health endpoints and auth endpoints are marked `@Public()`.

### VERIFY: AE-AUTH-005 — Login endpoint rate-limited via @Throttle decorator

The login endpoint (`POST /auth/login`) and registration endpoint (`POST /auth/register`) are rate-limited using the `@Throttle()` decorator from `@nestjs/throttler`. Auth routes use a stricter rate limit than the global default — typically 5 requests per 60 seconds — to prevent brute-force attacks. The `@Throttle()` decorator overrides the global ThrottlerModule configuration for these specific routes. Failed login attempts return 401 Unauthorized without revealing whether the email or password was incorrect.

---

## Token Flow

```
Register → POST /auth/register → 201 { user }
Login    → POST /auth/login    → 200 { accessToken, refreshToken }
Refresh  → POST /auth/refresh  → 200 { accessToken, refreshToken }
Protected→ GET /dashboards     → 200 (with Authorization: Bearer <token>)
```

---

## Security Constraints

- Passwords: minimum 8 characters, bcrypt hashed with shared BCRYPT_SALT_ROUNDS
- JWT secrets: loaded from environment variables (JWT_SECRET, JWT_REFRESH_SECRET), no hardcoded fallbacks
- Refresh tokens: single-use, rotated on each refresh call
- Rate limiting: auth routes limited to 5 requests per 60 seconds via @Throttle decorator
- Failed logins: generic error message, no email/password distinction leaked
