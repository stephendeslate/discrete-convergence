# Authentication Specification

## Overview

The Analytics Engine uses JWT-based authentication with bcryptjs for password hashing.
Users register with email, password, name, role, and tenantId. Login returns a signed
JWT token containing user claims for subsequent API requests.

See also: [Security Specification](security.md) for RBAC and guard details.
See also: [API Endpoints](api-endpoints.md) for auth route definitions.

## Registration

VERIFY: AE-AUTH-001
Users passwords are hashed with bcryptjs using BCRYPT_SALT_ROUNDS from shared package.

VERIFY: AE-AUTH-002
Registration only allows roles defined in ALLOWED_REGISTRATION_ROLES (USER, VIEWER).
ADMIN role cannot be self-assigned during registration.

VERIFY: AE-AUTH-003
Public decorator exempts auth and health routes from JWT guard.

VERIFY: AE-AUTH-004
Roles decorator enables RBAC enforcement on specific endpoints.

VERIFY: AE-AUTH-005
AuthService handles registration with duplicate email detection.

## Login

VERIFY: AE-AUTH-006
Login validates credentials and returns JWT access_token with user claims.

VERIFY: AE-AUTH-007
Auth controller exposes /auth/register and /auth/login as public endpoints.

## DTOs and Validation

VERIFY: AE-AUTH-008
RegisterDto validates email, password, name, role, and tenantId with class-validator.

VERIFY: AE-AUTH-009
LoginDto validates email and password with @IsEmail, @IsString, @MaxLength.

## JWT Strategy

VERIFY: AE-AUTH-010
JwtStrategy extracts token from Authorization Bearer header.

VERIFY: AE-AUTH-011
JwtAuthGuard as APP_GUARD protects all non-public routes globally.

VERIFY: AE-AUTH-012
RolesGuard checks @Roles() metadata against JWT payload for RBAC.

## Token Claims

The JWT payload contains:
- sub: user ID
- email: user email
- role: user role (ADMIN, USER, VIEWER)
- tenantId: tenant identifier for multi-tenant isolation

## Password Security

- Salt rounds: 12 (from shared BCRYPT_SALT_ROUNDS constant)
- Algorithm: bcryptjs (pure JavaScript, no native dependencies)
- Passwords are never returned in API responses
