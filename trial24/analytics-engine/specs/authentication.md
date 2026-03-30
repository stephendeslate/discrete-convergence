# Authentication Specification

## Overview

The Analytics Engine uses JWT-based authentication with bcryptjs password hashing.
All auth endpoints are handled by the auth module in `apps/api/src/auth/`.
See [security.md](security.md) for broader security concerns including RLS and RBAC.

## Module Structure

<!-- VERIFY:AUTH-MODULE -->
The `AuthModule` registers the auth service, controller, JWT strategy, and Passport module.
It imports `PrismaModule` for database access and `JwtModule` with async configuration.

<!-- VERIFY:AUTH-CONTROLLER -->
The `AuthController` exposes three endpoints: register, login, and refresh.
All endpoints accept JSON bodies validated by class-validator DTOs.

<!-- VERIFY:AUTH-SERVICE -->
The `AuthService` implements registration, login, and token refresh logic.
It uses bcryptjs for password hashing and Prisma for user persistence.

<!-- VERIFY:AUTH-DTO -->
Auth DTOs define validation rules for register (email, password, name, tenantId),
login (email, password), and refresh (refreshToken) request bodies.

## JWT Strategy

<!-- VERIFY:JWT-STRATEGY -->
The `JwtStrategy` extends Passport's JWT strategy. It extracts tokens from the
Authorization Bearer header and validates the payload contains userId and tenantId.

## Token Flow

1. **Registration**: User provides email, password, name, tenantId. Password is
   hashed with bcryptjs (salt rounds from env). Returns access + refresh token pair.
2. **Login**: Validates email/password against stored hash. Returns new token pair.
3. **Refresh**: Validates existing JWT, issues new access + refresh tokens.

## Auth Utilities

<!-- VERIFY:AUTH-UTILS -->
The `auth-utils.ts` helper extracts the validated user object from the request,
providing a typed interface for controllers to access userId and tenantId.

## Test Coverage

<!-- VERIFY:TEST-AUTH-SERVICE -->
Unit tests for `AuthService` cover registration with hashing, login validation,
duplicate email handling, and token refresh flows.

<!-- VERIFY:TEST-AUTH-INTEGRATION -->
Integration tests verify the full HTTP flow for register, login, and refresh
endpoints including error responses for invalid credentials.

## Cross-References

- Password hashing configuration: see [security.md](security.md)
- Tenant isolation via JWT claims: see [security.md](security.md)
- Token expiry settings: access=15m, refresh=7d
- User model definition: see [data-model.md](data-model.md)

<!-- VERIFY:AUTH-CONTROLLER-SPEC -->
<!-- VERIFY:AUTH-UTILS-SPEC -->
<!-- VERIFY:JWT-STRATEGY-SPEC -->
