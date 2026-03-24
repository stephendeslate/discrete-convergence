# Authentication Specification

## Overview

The Analytics Engine uses JWT-based authentication with bcrypt password hashing.

## Password Hashing

<!-- VERIFY: AE-AUTH-001 -->
- Algorithm: bcrypt
- Salt rounds: 12 (sourced from `BCRYPT_SALT_ROUNDS` in shared package)
- Passwords are hashed on registration and compared on login

## Registration

<!-- VERIFY: AE-AUTH-002 -->
- Only roles in `ALLOWED_REGISTRATION_ROLES` (USER, VIEWER) can self-register
- ADMIN accounts must be created through other means
- Registration requires: email, password (min 8 chars), role, tenantId

## Login

<!-- VERIFY: AE-AUTH-003 -->
- Returns both `accessToken` (15m expiry) and `refreshToken` (7d expiry)
- Invalid credentials return 401 Unauthorized with generic message
- Email lookup uses findFirst due to non-unique email across tenants

## Token Refresh

- Accepts a valid refresh token
- Returns new access and refresh token pair
- Invalid/expired tokens throw UnauthorizedException

## JWT Strategy

- Extracts token from Authorization Bearer header
- Validates token signature against JWT_SECRET
- Payload contains: sub (userId), email, role, tenantId

## Route Protection

<!-- VERIFY: AE-AUTH-005 -->
- JwtAuthGuard is applied globally via APP_GUARD
- Routes decorated with @Public() bypass JWT authentication
- Auth endpoints (register, login, refresh) are all @Public()

## Tenant Extraction

<!-- VERIFY: AE-AUTH-004 -->
- `getTenantId(req)` helper extracts tenantId from authenticated user
- Eliminates repeated `req.user` casting across controllers
