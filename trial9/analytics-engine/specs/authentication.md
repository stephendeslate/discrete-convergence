# Authentication Specification

## Overview

The Analytics Engine uses JWT-based authentication with bcryptjs for password hashing.
Multi-tenant support is enforced through tenant IDs embedded in JWT tokens.

See also: [Security Specification](security.md) for security hardening details.

## Requirements

### Registration

- VERIFY: AE-AUTH-001 — Password hashing uses BCRYPT_SALT_ROUNDS constant from shared package (value: 12)
- VERIFY: AE-AUTH-002 — Registration restricts roles via ALLOWED_REGISTRATION_ROLES (ADMIN excluded)
- VERIFY: AE-AUTH-003 — RegisterDto validates email, password (min 8 chars), name, role, and tenantId with class-validator decorators

### Login

- VERIFY: AE-AUTH-004 — AuthService handles login with bcryptjs comparison and JWT token generation
- VERIFY: AE-AUTH-005 — JwtStrategy validates JWT token and extracts user payload with tenantId
- VERIFY: AE-AUTH-006 — AuthController exposes public /auth/register and /auth/login endpoints
- VERIFY: AE-AUTH-007 — Integration tests cover registration, login, and authentication failure cases

### Token Management

- JWT tokens contain: sub (userId), email, role, tenantId
- Tokens expire after 1 hour (configurable via JWT_EXPIRES_IN)
- Token is signed with JWT_SECRET environment variable (validated at startup)
- Frontend stores token in httpOnly cookie after login

### Password Security

- Passwords are hashed using bcryptjs with 12 salt rounds
- Plain passwords are never stored or logged
- Password comparison uses constant-time bcrypt.compare
- Minimum password length: 8 characters (enforced by DTO validation)

### Multi-Tenant Context

- Every JWT payload includes tenantId
- Services receive tenantId from controller (extracted from req.user)
- Queries are scoped to tenantId for data isolation

## Error Handling

- Invalid credentials: 401 Unauthorized with generic message
- Missing token: 401 Unauthorized
- Invalid token: 401 Unauthorized
- Expired token: 401 Unauthorized
- Registration with ADMIN role: 400 Bad Request

## Test Coverage

- Unit tests: AuthService.register, AuthService.login, AuthService.validateUser
- Integration tests: POST /auth/register, POST /auth/login, GET /auth/profile
- Negative tests: wrong password, non-existent user, invalid token, ADMIN role rejection
