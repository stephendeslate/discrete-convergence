# Authentication Specification

> **Project:** Fleet Dispatch
> **Category:** AUTH
> **Related:** See [data-model.md](data-model.md) for User entity, see [security.md](security.md) for rate limiting on auth routes

---

## Overview

The fleet dispatch platform uses JWT-based authentication with bcryptjs password hashing. Users register with email/password and receive a JWT access token and refresh token. Admin roles cannot be self-registered — they are assigned via database seeding or direct assignment.

---

## Requirements

### VERIFY:FD-AUTH-001 — JWT authentication with bcryptjs

The auth module implements JWT-based authentication using `@nestjs/jwt` and `@nestjs/passport`. Passwords are hashed using bcryptjs with `BCRYPT_SALT_ROUNDS` imported from the shared package. The salt rounds value must not be hardcoded in any file — it must always reference the shared constant. Access tokens expire after a configurable duration. Refresh tokens are validated for token rotation.

### VERIFY:FD-AUTH-002 — Registration role restriction

User registration accepts a `role` field validated against `ALLOWED_REGISTRATION_ROLES` imported from the shared package. The `ADMIN` role is explicitly excluded from self-registration. The DTO uses `@IsIn(ALLOWED_REGISTRATION_ROLES)` to enforce this at the validation layer. Registration creates a new user record scoped to a tenant.

### VERIFY:FD-AUTH-003 — Login returns JWT tokens

The login endpoint validates email/password, verifies the user exists and password matches, then returns an access token and refresh token. The JWT payload includes userId, email, role, and tenantId. Failed login attempts return 401 without revealing whether the email or password was incorrect.

### VERIFY:FD-AUTH-004 — Auth guard as global APP_GUARD

`JwtAuthGuard` is registered as a global `APP_GUARD` in `AppModule.providers` using NestJS dependency injection. Domain controllers do NOT use `@UseGuards(JwtAuthGuard)` — the global guard protects all routes by default. Routes that need to bypass auth use the `@Public()` custom decorator.

### VERIFY:FD-AUTH-005 — Public decorator for open routes

A custom `@Public()` decorator using `SetMetadata` allows specific routes to bypass JWT authentication. Health endpoints (`/health`, `/health/ready`) and auth endpoints (`/auth/login`, `/auth/register`) are marked `@Public()`. The JwtAuthGuard checks for the public metadata and skips validation when present.

### VERIFY:FD-AUTH-006 — getTenantId utility for controller scoping

A `getTenantId(req)` utility function extracts the authenticated user's `tenantId` from the request object. All domain controllers use this utility to scope CRUD operations to the tenant, ensuring multi-tenant isolation at the application layer.

---

## Token Flow

```
Register → POST /auth/register → 201 { user }
Login → POST /auth/login → 200 { accessToken, refreshToken }
Refresh → POST /auth/refresh → 200 { accessToken, refreshToken }
Protected → GET /vehicles → 200 (with Authorization: Bearer <token>)
```

---

## Security Constraints

- Passwords: minimum 8 characters, bcryptjs hashed
- JWT secrets: loaded from environment variables, no hardcoded fallbacks
- Refresh tokens: single-use, rotated on each refresh call
- Rate limiting: auth routes limited to 5 requests per 60 seconds (see [security.md](security.md))
