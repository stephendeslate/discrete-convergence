# Authentication Specification

## Overview

The Analytics Engine uses JWT-based authentication with bcryptjs password hashing.
Users authenticate via email/password and receive a signed JWT for subsequent requests.

See also: [Security Specification](security.md) for security enforcement details.
See also: [API Endpoints](api-endpoints.md) for route definitions.

## Authentication Flow

### Registration

VERIFY: AE-AUTH-001
Users register with email, password, name, role, and tenantId.
The password is hashed using bcryptjs with BCRYPT_SALT_ROUNDS (12) from shared package.

VERIFY: AE-AUTH-002
Registration DTO validates all fields:
- email: @IsEmail(), @IsString(), @MaxLength(255)
- password: @IsString(), @MinLength(8), @MaxLength(128)
- name: @IsString(), @MaxLength(100)
- role: @IsIn(ALLOWED_REGISTRATION_ROLES) — ADMIN excluded
- tenantId: @IsString(), @MaxLength(36)

VERIFY: AE-AUTH-003
Login DTO validates:
- email: @IsEmail(), @IsString(), @MaxLength(255)
- password: @IsString(), @MaxLength(128)

### JWT Token Structure

VERIFY: AE-AUTH-004
The JWT payload contains: sub (userId), email, role, tenantId.
The AuthService creates tokens via JwtService.signAsync with proper payload structure.

VERIFY: AE-AUTH-005
The AuthController exposes:
- POST /auth/register (public)
- POST /auth/login (public)
- GET /auth/profile (authenticated)

VERIFY: AE-AUTH-006
JwtStrategy extracts Bearer token from Authorization header.
It validates the token signature and expiration before passing the payload.

VERIFY: AE-AUTH-007
AuthModule configures PassportModule with JWT strategy and JwtModule
with secret from environment and 1-hour token expiration.

### Error Handling

VERIFY: AE-AUTH-008
Auth integration tests verify:
- Successful registration and login flows
- Invalid email rejection
- ADMIN role rejection during registration
- Duplicate email handling
- Wrong password rejection
- Missing token handling
- Expired token handling

VERIFY: AE-AUTH-009
Auth service unit tests verify behavioral assertions:
- Register checks email uniqueness via findFirst
- Login validates password with bcrypt.compare
- ValidateUser retrieves user by ID
