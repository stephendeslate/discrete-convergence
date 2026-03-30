# Authentication Specification

## Overview
The Event Management Platform uses JWT-based authentication with access and refresh tokens.
Access tokens expire in 1 hour; refresh tokens expire in 7 days.

## Endpoints

### POST /auth/login
- Accepts email and password
- Returns access_token and refresh_token
- Uses bcryptjs for password comparison (see [security.md](security.md))
- Rate limited: 10 requests per second per IP

### POST /auth/register
- Accepts email, password, firstName, lastName, organizationId, role
- Role restricted to ALLOWED_REGISTRATION_ROLES (ATTENDEE only)
- Returns access_token and refresh_token
- Checks for duplicate email before creating user

### POST /auth/refresh
- Accepts refreshToken in body
- Returns new access_token
- Validates against JWT_REFRESH_SECRET

## JWT Payload
```typescript
interface JwtPayload {
  sub: string;        // user id
  email: string;
  role: string;
  organizationId: string;
}
```

## Security
- JWT_SECRET and JWT_REFRESH_SECRET must be set (see [infrastructure.md](infrastructure.md))
- Tokens signed with HS256
- Access token max lifetime: 1 hour (no hardcoded secrets)
- Global JwtAuthGuard applied as APP_GUARD (see [security.md](security.md))

## VERIFY Tags
VERIFY: EM-AUTH-001 — AuthService handles login, register, refresh
VERIFY: EM-AUTH-002 — Auth endpoints with rate limiting
VERIFY: EM-AUTH-003 — JWT strategy extracts Bearer token

## Cross-References
- [security.md](security.md) — Guard configuration, bcryptjs usage
- [infrastructure.md](infrastructure.md) — Environment variable validation
- [api-endpoints.md](api-endpoints.md) — Full endpoint listing
- [frontend.md](frontend.md) — Login/register form integration

## Password Storage
- bcryptjs with BCRYPT_SALT_ROUNDS (12) from shared package
- Never store plaintext passwords
- Password minimum 8 characters, maximum 128

## Error Handling
- Invalid credentials: 401 Unauthorized
- Duplicate email: 409 Conflict
- Invalid refresh token: 401 Unauthorized
- Validation failures: 400 Bad Request
