# Authentication Specification

## Overview

The event management platform uses JWT-based authentication with bcryptjs for password hashing.
All authentication endpoints are public (exempt from JWT guard). Registration is restricted
to VIEWER role only; ADMIN accounts are created through seeding or direct database operations.

## Authentication Flow

### Registration

Users register by providing email, password, name, tenant ID, and role.
The system validates input using class-validator decorators and checks for duplicate emails.

- VERIFY: EM-AUTH-001 — BCRYPT_SALT_ROUNDS imported from shared package, set to 12
- VERIFY: EM-AUTH-002 — Registration restricted to ALLOWED_REGISTRATION_ROLES (VIEWER only)
- VERIFY: EM-AUTH-003 — RegisterDto uses class-validator decorators with @IsEmail, @MaxLength, @IsIn

### Login

Users authenticate with email and password. The system verifies credentials
and returns a signed JWT containing user ID, email, role, and tenant ID.

- VERIFY: EM-AUTH-004 — AuthService handles registration and login with bcryptjs
- VERIFY: EM-AUTH-005 — AuthController exposes /auth/register and /auth/login as @Public endpoints

### JWT Strategy

The JWT strategy extracts tokens from the Authorization header using Bearer scheme.
Tokens expire after 1 hour for security compliance.

- VERIFY: EM-AUTH-006 — AuthModule configures JwtModule with 1h expiry

## Security Considerations

- Passwords are hashed with bcryptjs at 12 salt rounds
- JWT tokens contain tenantId for multi-tenant isolation
- Login errors use generic "Invalid credentials" message to prevent user enumeration
- Token expiry is set to 1 hour maximum (v1.4-dc compliance)
- No hardcoded JWT_SECRET fallbacks — validated at startup

## Cross-References

- See [security.md](security.md) for global guard configuration
- See [data-model.md](data-model.md) for User model schema
- See [api-endpoints.md](api-endpoints.md) for endpoint definitions
- See [monitoring.md](monitoring.md) for error logging during auth failures

## Token Payload Structure

The JWT payload includes:
- `sub`: User ID (UUID)
- `email`: User email
- `role`: UserRole enum value (ADMIN or VIEWER)
- `tenantId`: Tenant ID for multi-tenant isolation

All protected endpoints extract this payload to scope queries by tenant.
