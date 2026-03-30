# Authentication Specification

## Overview

JWT-based authentication with access and refresh tokens. Users register with
email and password, receive tokens on login, and refresh expired access tokens.
See [security.md](security.md) for broader security concerns.

## Module Structure

<!-- VERIFY:AUTH-MODULE -->
The `AuthModule` registers the auth service, controller, JWT strategy, and
Passport module. It imports PrismaModule for database access.

<!-- VERIFY:AUTH-CONTROLLER -->
The `AuthController` exposes endpoints for register, login, refresh, and
current user profile. All endpoints accept JSON bodies validated by DTOs.

<!-- VERIFY:AUTH-SERVICE -->
The `AuthService` implements registration with bcryptjs hashing, login with
credential validation, and token refresh. It generates JWT token pairs
with access (15m) and refresh (7d) expiry.

<!-- VERIFY:AUTH-DTO -->
Auth DTOs define validation rules: email (IsEmail), password (min 8 chars),
organizationId (IsUUID). class-validator decorators enforce constraints.

## JWT Strategy

<!-- VERIFY:JWT-STRATEGY -->
The `JwtStrategy` extends Passport's JWT strategy. It extracts tokens from
the Authorization Bearer header and validates the payload contains userId
and organizationId claims.

## Auth Utilities

<!-- VERIFY:AUTH-UTILS -->
The `auth-utils.ts` helper extracts the validated user object from the
request, providing a typed interface for controllers to access userId
and organizationId.

<!-- VERIFY:AUTH-UTILS-SPEC -->
Unit tests for auth-utils verify user extraction from requests and
error handling for missing or malformed authentication data.

## Registration Flow

1. Validate input via DTOs
2. Check if email already exists within the organization
3. Hash password with bcryptjs (BCRYPT_SALT_ROUNDS=12)
4. Create user with role=VIEWER (no admin self-registration)
5. Return access + refresh token pair

## Login Flow

1. Find user by email
2. Compare password with bcryptjs
3. Generate access token (15m) and refresh token (7d)
4. Return tokens

## Test Coverage

<!-- VERIFY:AUTH-SERVICE-SPEC -->
Unit tests for AuthService cover registration with hashing, login validation,
duplicate email handling, and token refresh flows.

<!-- VERIFY:TEST-AUTH-INTEGRATION -->
Integration tests verify the full HTTP flow for register, login, and refresh
endpoints including error responses for invalid credentials.

## Cross-References

- Password hashing and rate limiting: see [security.md](security.md)
- Tenant isolation via JWT claims: see [security.md](security.md)
- User data model: see [data-model.md](data-model.md)
