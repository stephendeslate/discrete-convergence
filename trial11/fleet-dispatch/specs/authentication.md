# Authentication Specification

## Overview

Fleet Dispatch uses JWT-based authentication with bcryptjs password hashing.
Users register with email and password, receive a JWT token on login, and
include the token in subsequent API requests via the Authorization header.

## Registration

- VERIFY: FD-AUTH-001 — bcryptjs with BCRYPT_SALT_ROUNDS from shared package
- VERIFY: FD-AUTH-002 — Registration restricted to ALLOWED_REGISTRATION_ROLES (DISPATCHER, DRIVER only)
- VERIFY: FD-AUTH-003 — Registration DTO validates email with @IsEmail(), @IsString(), @MaxLength()
- VERIFY: FD-AUTH-004 — Registration DTO validates password with @IsString(), @MaxLength()
- VERIFY: FD-AUTH-005 — Duplicate email returns 409 Conflict

## Login

- VERIFY: FD-AUTH-006 — Login validates credentials and returns JWT access_token
- VERIFY: FD-AUTH-007 — Invalid credentials return 401 Unauthorized
- VERIFY: FD-AUTH-008 — JWT payload contains userId, email, role, tenantId

## JWT Strategy

- VERIFY: FD-AUTH-009 — JWT strategy validates token from Authorization Bearer header
- VERIFY: FD-AUTH-010 — JWT secret loaded from environment variable (no fallback)

## RBAC

- VERIFY: FD-AUTH-011 — RolesGuard checks @Roles() metadata against JWT role
- VERIFY: FD-AUTH-012 — Admin-only endpoints protected with @Roles('ADMIN')

## Token Storage (Frontend)

The login server action must store the JWT token after successful authentication.
See [Frontend Specification](frontend.md) for implementation details.

- VERIFY: FD-AUTH-013 — Login server action stores token via cookies().set()

## Security Integration

Authentication integrates with the security layer described in [Security Specification](security.md):
- Global JwtAuthGuard registered as APP_GUARD
- @Public() decorator exempts auth and health endpoints
- Rate limiting on auth endpoints (5 requests per 60 seconds)

## User Roles

| Role | Description | Capabilities |
|------|-------------|-------------|
| ADMIN | System administrator | Full CRUD, user management |
| DISPATCHER | Dispatch coordinator | Create/manage dispatches, view vehicles/drivers |
| DRIVER | Vehicle operator | View assigned dispatches, update status |

## Password Requirements

- Minimum validation via @IsString() and @MaxLength(255)
- Hashed with bcryptjs using 12 salt rounds
- Never stored in plain text
- Never returned in API responses

## Session Management

- JWT tokens expire after 1 hour (configurable via JWT_EXPIRY)
- No refresh token mechanism (stateless auth)
- Token revocation not implemented (stateless design)
