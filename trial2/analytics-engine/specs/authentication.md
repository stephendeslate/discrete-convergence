# Authentication Specification

## Overview

The Analytics Engine uses JWT-based authentication with bcrypt password hashing.
All authenticated endpoints require a valid Bearer token in the Authorization header.
Registration is restricted to non-admin roles via shared constant validation.

## Authentication Flow

### Registration

1. User submits email, password, name, tenant name, and optional role
2. System validates role against `ALLOWED_REGISTRATION_ROLES` from shared package
3. Password is hashed using bcrypt with `BCRYPT_SALT_ROUNDS` (12) from shared
4. A new tenant is created with the provided tenant name
5. User record is created and linked to the tenant
6. JWT access token (1h) and refresh token (7d) are returned

### Login

1. User submits email and password
2. System looks up user by email
3. Password is compared against stored hash using bcrypt
4. If valid, JWT access token and refresh token are returned
5. If invalid, 401 Unauthorized is returned

### Token Refresh

1. Client submits refresh token
2. System verifies the token
3. If valid, new access and refresh tokens are issued
4. If invalid, 401 Unauthorized is returned

## Requirements

<!-- VERIFY:AE-AUTH-001 — Registration DTO validates roles against ALLOWED_REGISTRATION_ROLES, excluding ADMIN -->
- REQ-AUTH-001: Registration must validate roles against shared ALLOWED_REGISTRATION_ROLES
- ADMIN role must be excluded from self-registration

<!-- VERIFY:AE-AUTH-002 — Auth service uses bcrypt with BCRYPT_SALT_ROUNDS from shared -->
- REQ-AUTH-002: Password hashing must use bcrypt with salt rounds from shared package
- No hardcoded salt round values in auth service code

<!-- VERIFY:AE-AUTH-003 — Auth controller routes are marked @Public() -->
- REQ-AUTH-003: All auth controller routes must be marked with @Public() decorator
- Auth routes must be accessible without a JWT token

## JWT Configuration

- Access token expiry: 1 hour
- Refresh token expiry: 7 days
- Secret is loaded from `JWT_SECRET` environment variable
- No fallback secret is permitted (see [security.md](security.md))

## DTO Validation

- Email: @IsEmail() + @IsString() + @MaxLength(255)
- Password: @IsString() + @MaxLength(128)
- Name: @IsString() + @MaxLength(100)
- TenantName: @IsString() + @MaxLength(100)
- Role: @IsOptional() + @IsString() + @IsIn(ALLOWED_REGISTRATION_ROLES)

## Error Handling

- Invalid credentials: 401 Unauthorized
- Duplicate email: 409 Conflict
- Validation failure: 400 Bad Request
- Invalid refresh token: 401 Unauthorized

## Integration with Shared Package

The auth module imports the following from `@analytics-engine/shared`:
- `BCRYPT_SALT_ROUNDS`: Used for password hashing
- `ALLOWED_REGISTRATION_ROLES`: Used for registration role validation

## Testing Requirements

- Integration tests verify registration, login, and refresh flows
- Tests must import BCRYPT_SALT_ROUNDS from shared (no hardcoded values)
- Tests must verify ADMIN role rejection
- Tests must verify extra field rejection (forbidNonWhitelisted)
