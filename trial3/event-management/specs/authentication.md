# Authentication Specification

## Overview

The Event Management platform uses JWT-based authentication with bcrypt password hashing.
All users belong to an organization (multi-tenant). Authentication supports login, registration,
and token refresh. See [security.md](security.md) for security hardening details.

## Requirements

### VERIFY:EM-AUTH-001
JWT payload must contain: sub (userId), email, role, organizationId.
The JwtPayload interface defines the token structure used across the system.

### VERIFY:EM-AUTH-002
AuthService must use BCRYPT_SALT_ROUNDS from the shared package for password hashing.
Registration must reject ADMIN role via ALLOWED_REGISTRATION_ROLES validation.
Login must use findFirst with organizationId scoping for multi-tenant isolation.

### VERIFY:EM-AUTH-003
AuthController exposes POST /auth/register and POST /auth/login.
Both endpoints must be decorated with @Public() to exempt from JWT guard.

### VERIFY:EM-AUTH-004
JwtStrategy must extract token from Authorization Bearer header.
The validate method returns an AuthenticatedUser object with userId, email, role, organizationId.

### VERIFY:EM-AUTH-005
RegisterDto must validate: email (@IsEmail + @IsString + @MaxLength), password (@IsString + @MinLength + @MaxLength),
name (@IsString + @MaxLength), role (@IsIn(ALLOWED_REGISTRATION_ROLES)), organizationId (@IsUUID + @MaxLength(36)).

## Password Security

- Passwords are hashed with bcrypt using BCRYPT_SALT_ROUNDS (12) from shared
- Salt rounds constant is imported from @event-management/shared, never hardcoded
- Plain-text passwords are never stored or logged
- Password comparison uses bcrypt.compare for constant-time comparison

## Token Management

- JWT tokens expire after 24 hours
- Token secret is provided via JWT_SECRET environment variable
- No hardcoded secret fallbacks are permitted
- Tokens are signed with HS256 algorithm by default

## Multi-Tenant Authentication

- Users are scoped to organizations via organizationId
- Email uniqueness is enforced per organization (@@unique([email, organizationId]))
- Login requires organizationId to scope the user lookup
- All authenticated requests include organizationId in the JWT payload

## Error Handling

- Invalid credentials return 401 Unauthorized
- Duplicate email returns 409 Conflict
- Invalid role returns 401 Unauthorized
- Missing or malformed fields return 400 Bad Request

## Integration with Other Modules

- JwtAuthGuard is registered as APP_GUARD in AppModule
- Domain controllers do not use @UseGuards(JwtAuthGuard) — rely on global guard
- @Public() decorator exempts health, auth, and public event endpoints
- See [api-endpoints.md](api-endpoints.md) for endpoint authorization matrix
