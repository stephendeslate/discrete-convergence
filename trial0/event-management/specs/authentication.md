# Authentication Specification

## Overview
JWT-based authentication with bcrypt password hashing, role-based registration,
and global guard protection with @Public() exemptions.

## Registration
- VERIFY:EM-DTO-001 — RegisterDto validates role against ALLOWED_REGISTRATION_ROLES
- VERIFY:EM-AUTH-001 — @Public() decorator sets IS_PUBLIC metadata key
- VERIFY:EM-AUTH-002 — AuthService.register hashes password with BCRYPT_SALT_ROUNDS from shared
- VERIFY:EM-AUTH-002 — AuthService.login verifies bcrypt hash and returns JWT
- VERIFY:EM-AUTH-002 — AuthService.refresh generates new token from existing payload

## Guards
- VERIFY:EM-GUARD-001 — APP_GUARD includes ThrottlerGuard for rate limiting
- VERIFY:EM-GUARD-002 — APP_GUARD includes JwtAuthGuard checking IS_PUBLIC metadata
- VERIFY:EM-AUTH-003 — AuthController marks register/login as @Public()

## JWT Strategy
- VERIFY:EM-AUTH-004 — JwtStrategy extracts from Bearer token, validates with JWT_SECRET
- VERIFY:EM-AUTH-005 — JwtAuthGuard extends AuthGuard('jwt') with @Public() bypass
- VERIFY:EM-CONST-001 — BCRYPT_SALT_ROUNDS and ALLOWED_REGISTRATION_ROLES from shared constants

## Security Integration
- Cross-reference: [security.md](./security.md) — CORS, helmet, throttle configuration
- Cross-reference: [data-model.md](./data-model.md) — User model with role enum and tenantId
- Cross-reference: [api-endpoints.md](./api-endpoints.md) — Protected vs public route distinction

## Test Coverage
- VERIFY:EM-TEST-001 — Integration test: register → login → access protected route
- VERIFY:EM-TEST-007 — Unit test: AuthService register/login/refresh logic

## Password Policy
- Minimum 8 characters enforced by DTO @MinLength
- Bcrypt with configurable salt rounds (default 12)
- Passwords never logged (sanitizer strips password/token fields)

## Token Format
- JWT payload: { sub: userId, email, role, tenantId }
- Configurable expiration via JWT_EXPIRES_IN env var
- Refresh generates new token preserving payload fields

## Role-Based Access
- UserRole enum: ADMIN, ORGANIZER, ATTENDEE (cross-reference: [data-model.md](./data-model.md))
- ALLOWED_REGISTRATION_ROLES from shared constants restricts self-registration to safe roles
- ADMIN role cannot be self-registered; must be assigned by existing admin
- Role is embedded in JWT and available on every authenticated request via req.user
- VERIFY:EM-AUTH-006 — Role validation in RegisterDto rejects roles not in ALLOWED_REGISTRATION_ROLES

## Multi-Tenant Isolation
- Every authenticated request carries tenantId in the JWT payload
- Services scope all database queries by tenantId from the request context
- Cross-reference: [data-model.md](./data-model.md) — RLS policies enforce tenant isolation at the database level
- Cross-reference: [security.md](./security.md) — Defense-in-depth with both application and database-level enforcement

## Error Handling
- Invalid credentials return 401 with structured error response (no credential hints)
- Duplicate email registration returns 409 Conflict
- Expired tokens return 401; client must call /auth/refresh
- All auth errors are logged via structured logging with sanitized context
- Cross-reference: [monitoring.md](./monitoring.md) — GlobalExceptionFilter handles unhandled auth errors
