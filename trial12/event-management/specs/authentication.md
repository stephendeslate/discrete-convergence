# Authentication Specification

## Overview

The Event Management platform uses JWT-based authentication with bcryptjs for password hashing. Authentication is handled by a dedicated NestJS auth module with global guard protection.

See also: [Security Specification](security.md) for RBAC and guard details.

## Registration

VERIFY: EM-AUTH-001
Registration accepts email, password, name, role, and tenantId. All fields are validated with class-validator decorators.

VERIFY: EM-AUTH-002
Login accepts email and password, returning a JWT access token on success.

VERIFY: EM-AUTH-003
Registration restricts roles via ALLOWED_REGISTRATION_ROLES from the shared package. ADMIN role cannot be self-assigned during registration.

## Authentication Flow

VERIFY: EM-AUTH-004
AuthService handles registration (with duplicate email detection) and login (with bcryptjs password comparison). Uses BCRYPT_SALT_ROUNDS from shared.

VERIFY: EM-AUTH-005
AuthController provides public POST /auth/register and POST /auth/login endpoints, both decorated with @Public() to bypass the global JWT guard.

VERIFY: EM-AUTH-006
JwtStrategy validates JWT tokens from the Authorization header, extracting sub, email, role, and tenantId from the payload.

VERIFY: EM-AUTH-007
AuthModule configures PassportModule and JwtModule with signOptions expiresIn of 1 hour.

## Token Format

The JWT payload includes:
- `sub`: user ID
- `email`: user email
- `role`: user role (ADMIN, USER, ORGANIZER)
- `tenantId`: tenant identifier for multi-tenancy

## Password Security

- bcryptjs (pure JS, no native dependencies) with 12 salt rounds
- Password hashes stored in `password_hash` column
- Passwords never logged (sanitized by log context sanitizer)

## Error Handling

- Duplicate email returns 409 Conflict
- Invalid credentials returns 401 Unauthorized
- Missing fields returns 400 Bad Request
- Invalid role returns 400 Bad Request

## Integration Testing

VERIFY: EM-AUTH-008
Auth service unit tests verify registration, duplicate detection, and login failure scenarios with mocked Prisma.

VERIFY: EM-AUTH-009
Auth integration tests use supertest with real AppModule compilation to verify the full authentication flow.
