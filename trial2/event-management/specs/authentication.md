# Authentication Specification

## Overview

The Event Management platform uses JWT-based authentication with bcrypt password hashing.
Authentication is enforced globally via `APP_GUARD` — all endpoints require authentication
unless explicitly marked with `@Public()`.

## Authentication Flow

1. User registers with email, password, name, organization, and role
2. Password is hashed with bcrypt using `BCRYPT_SALT_ROUNDS` (12) from shared package
3. JWT token is issued containing `sub`, `email`, `role`, `organizationId`
4. Subsequent requests include token in `Authorization: Bearer <token>` header
5. `JwtAuthGuard` (registered as `APP_GUARD`) validates all requests
6. Routes decorated with `@Public()` bypass authentication

## Registration Rules

- Only `ORGANIZER` and `ATTENDEE` roles are allowed during registration
- `ADMIN` role is explicitly excluded via `@IsIn(ALLOWED_REGISTRATION_ROLES)`
- The `ALLOWED_REGISTRATION_ROLES` constant comes from the shared package
- Email must be unique per organization (compound uniqueness)

## Security Requirements

<!-- VERIFY:EM-AUTH-001 — Registration DTO restricts roles via ALLOWED_REGISTRATION_ROLES -->
- Registration endpoint validates role against `ALLOWED_REGISTRATION_ROLES` from shared

<!-- VERIFY:EM-AUTH-002 — Auth service uses BCRYPT_SALT_ROUNDS from shared -->
- Password hashing uses `BCRYPT_SALT_ROUNDS` constant from shared package

<!-- VERIFY:EM-AUTH-003 — JWT strategy extracts token from Bearer header -->
- JWT strategy extracts token from `Authorization` header using Passport

## Token Structure

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "ORGANIZER",
  "organizationId": "org-uuid",
  "iat": 1234567890,
  "exp": 1234571490
}
```

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/login | Public | Authenticate user, return JWT |
| POST | /auth/register | Public | Create account, return JWT |
| POST | /auth/refresh | Public | Refresh expired JWT |

## Error Handling

- Invalid credentials: 401 Unauthorized
- Email already exists: 409 Conflict
- Invalid role: 400 Bad Request
- Expired token: 401 Unauthorized

## Cross-References

- See [security.md](security.md) for global security configuration
- See [api-endpoints.md](api-endpoints.md) for full endpoint inventory
