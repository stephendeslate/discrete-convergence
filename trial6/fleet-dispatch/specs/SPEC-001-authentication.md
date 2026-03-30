# SPEC-001: Authentication

**Status:** APPROVED
**Domain:** Authentication & Authorization
**Cross-references:** [SPEC-006](SPEC-006-multi-tenancy.md), [SPEC-008](SPEC-008-security.md)

## Overview

Fleet Dispatch uses JWT-based authentication with bcrypt password hashing.
Passport.js handles token extraction and validation via the `passport-jwt` strategy.

## Password Hashing

- Algorithm: bcrypt
- Salt rounds: 12 (shared constant `BCRYPT_SALT_ROUNDS`)
- Passwords are never stored in plaintext; only `password_hash` is persisted

<!-- VERIFY:FD-AUTH-001 — bcrypt salt rounds = 12 -->

## Registration

- Self-registration is exposed at `POST /auth/register` (public endpoint)
- Only `DISPATCHER` and `DRIVER` roles are permitted during self-registration
- `ADMIN` accounts must be created via seed or direct database access
- Duplicate `email + tenantId` combinations are rejected with `409 Conflict`
- Registration returns `{ accessToken }` on success

<!-- VERIFY:FD-AUTH-002 — ADMIN excluded from self-registration -->
<!-- VERIFY:FD-AUTH-003 — registration DTO validates role against allowed list -->

## JWT Token Structure

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "DISPATCHER",
  "tenantId": "tenant-uuid",
  "iat": 1234567890,
  "exp": 1234654290
}
```

- Expiration: 24 hours
- Extracted from `Authorization: Bearer <token>` header
- Secret loaded from `JWT_SECRET` environment variable

<!-- VERIFY:FD-AUTH-004 — JWT strategy extracts sub, email, role, tenantId -->
<!-- VERIFY:FD-AUTH-005 — auth service signs JWT with user payload -->

## Login Flow

1. Client sends `POST /auth/login` with `{ email, password }`
2. Service looks up user by email (`findFirst` for multi-tenant lookup)
3. `bcrypt.compare` validates password against stored hash
4. JWT signed with user payload and returned as `{ accessToken }`
5. On failure, `401 Unauthorized` with generic "Invalid credentials" message

<!-- VERIFY:FD-AUTH-006 — auth controller @Public() on login/register -->

## Frontend Integration

- Token stored in cookie after login
- `getToken()` helper in `lib/actions.ts` retrieves the token
- All API calls include `Authorization: Bearer <token>` header
- Protected pages redirect to `/login` via Next.js middleware
