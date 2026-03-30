# Authentication Specification

## Overview

The Analytics Engine uses JWT-based authentication with bcrypt password hashing.
Users belong to tenants and are scoped by tenant ID in all operations.
Authentication is implemented as a NestJS module with Passport.js integration.

## Requirements

### Auth Service

The auth service handles login and registration flows. Login accepts email
and password, validates credentials using bcrypt comparison, and returns
a signed JWT token. Registration creates both a tenant and a user in a
single transaction.

- VERIFY:AE-AUTH-001 — Auth service implements JWT login with bcrypt password
  comparison and JWT token generation via JwtService.sign()

### JWT Payload

The JWT payload contains the user ID (sub), email, role, and tenant ID.
This payload is extracted by the JWT strategy and made available as
`req.user` on authenticated requests.

- VERIFY:AE-AUTH-002 — JWT payload interface includes sub, email, role, tenantId

### Public Routes

Routes that do not require authentication are decorated with `@Public()`.
The JwtAuthGuard checks for this metadata and skips validation when present.
Auth endpoints (login, register) and health endpoints must be public.

- VERIFY:AE-AUTH-003 — @Public() decorator uses SetMetadata to exempt routes

### Registration Validation

Registration DTOs enforce role validation using `@IsIn(ALLOWED_REGISTRATION_ROLES)`.
The ADMIN role is excluded from self-registration to prevent privilege escalation.
See [security.md](security.md) for the full security model.

- VERIFY:AE-AUTH-004 — Register DTO uses @IsIn(ALLOWED_REGISTRATION_ROLES) to block ADMIN

### JWT Auth Guard

The JwtAuthGuard is registered as a global APP_GUARD in AppModule.
It extends Passport's AuthGuard and checks for the @Public() metadata
reflector to determine whether to enforce authentication.
See [monitoring.md](monitoring.md) for health endpoint exemptions.

- VERIFY:AE-AUTH-005 — JwtAuthGuard as APP_GUARD with @Public() reflector check

## Security Considerations

- Passwords are hashed with bcrypt using BCRYPT_SALT_ROUNDS from shared
- JWT secret is loaded from environment with no fallback
- JWT expiry defaults to 1 hour
- Failed login attempts return generic "Invalid credentials" message
- No user enumeration through error messages

## Related Specifications

- [security.md](security.md) — Rate limiting, CSP, CORS
- [monitoring.md](monitoring.md) — Request logging, correlation IDs
