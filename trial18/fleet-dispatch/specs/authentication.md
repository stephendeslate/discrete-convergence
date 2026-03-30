# Authentication Specification

## Overview

Fleet Dispatch uses JWT-based authentication with bcryptjs password hashing.
All protected endpoints require a valid JWT token in the Authorization header.
Registration is restricted to allowed roles defined in the shared constants package.

## Auth Constants

<!-- VERIFY: FD-AUTH-001 -->
The shared constants module exports `BCRYPT_SALT_ROUNDS` (value: 12) used for
password hashing. This constant is imported by the auth service and seed script
to ensure consistent hashing strength across the application.

## Registration Role Restriction

<!-- VERIFY: FD-AUTH-002 -->
The `RegisterDto` validates the `role` field against `ALLOWED_REGISTRATION_ROLES`
from the shared package using `@IsIn()`. This prevents users from self-assigning
privileged roles (e.g., admin) during registration. Only roles explicitly listed
in the constant are accepted.

## Registration Duplicate Check

<!-- VERIFY: FD-AUTH-003 -->
The shared constants export `ALLOWED_REGISTRATION_ROLES` which the auth service
uses to validate incoming registration requests. The auth service checks for
existing users with the same email before creating a new account, returning a
409 Conflict if a duplicate is found.

## Auth Service Login/Register

<!-- VERIFY: FD-AUTH-004 -->
The `AuthService` implements `login()` and `register()` methods:
- `login()`: Finds user by email (findFirst — email is unique per tenant context),
  compares password with bcryptjs, returns signed JWT with userId, email, role,
  and tenantId in the payload.
- `register()`: Validates role against allowed list, checks for existing email,
  hashes password with BCRYPT_SALT_ROUNDS, creates user record, returns signed JWT.

Both methods use `findFirst` with justification comments explaining why findFirst
is appropriate (unique email lookup within tenant scope).

## Auth Controller Public Routes

<!-- VERIFY: FD-AUTH-005 -->
The `AuthController` exposes `POST /auth/login` and `POST /auth/register` endpoints.
Both are decorated with `@Public()` to bypass the global JWT guard, since
unauthenticated users need access to these endpoints. Request validation is handled
by `ValidationPipe` with `whitelist` and `forbidNonWhitelisted` options.

## Cross-References

- JWT secret configuration: see [security.md](security.md) (FD-SEC-004)
- Password hashing constants: see shared package in [infrastructure.md](infrastructure.md)
- Token payload structure used by all protected endpoints: see [api-endpoints.md](api-endpoints.md)
- Rate limiting on auth endpoints: see [cross-layer.md](cross-layer.md) (FD-CROSS-001)

## Token Lifecycle

Tokens are issued with a 1-hour expiry (`signOptions: { expiresIn: '1h' }`).
The JWT module is registered in `AuthModule` with the secret sourced from
`process.env.JWT_SECRET`. There is no hardcoded fallback — the application
will fail to start if `JWT_SECRET` is not set, enforced by `validateEnvVars()`.

## Password Security

Passwords are hashed using `bcryptjs` (pure JavaScript implementation) rather
than the native `bcrypt` package. This avoids native compilation dependencies
and associated security vulnerabilities in the build chain. The salt rounds
value of 12 provides adequate security while maintaining acceptable performance.
