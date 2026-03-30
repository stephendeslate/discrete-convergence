# Authentication Specification

## Overview

Fleet Dispatch uses JWT-based authentication with bcrypt password hashing.
The authentication module handles login, registration, and token refresh flows.
See [security.md](security.md) for security hardening details.

## Authentication Flow

### Login
1. User submits email and password
2. System validates credentials against bcrypt hash
3. System generates JWT with user claims (sub, email, role, companyId)
4. JWT returned as accessToken

### Registration
1. User submits registration form
2. System validates role against ALLOWED_REGISTRATION_ROLES (ADMIN excluded)
3. Password hashed with BCRYPT_SALT_ROUNDS (12) from shared package
4. User created in database
5. JWT generated and returned

### Token Refresh
1. Authenticated user requests token refresh
2. System validates existing JWT
3. New JWT generated with refreshed claims

## Requirements

### VERIFY:FD-AUTH-001 — Auth Service Implementation
The AuthService must implement login, register, and refresh methods.
Login must verify bcrypt hash. Register must hash with BCRYPT_SALT_ROUNDS from shared.
Refresh must validate the user exists before issuing a new token.

### VERIFY:FD-AUTH-002 — Auth Controller Routes
The AuthController must expose POST /auth/login, POST /auth/register, and POST /auth/refresh.
Login and register routes must be decorated with @Public() to bypass JwtAuthGuard.
Refresh requires authentication.

### VERIFY:FD-AUTH-003 — Registration DTO Validation
RegisterDto must validate: @IsEmail() on email, @IsIn(ALLOWED_REGISTRATION_ROLES) on role,
@MaxLength(36) on companyId, @IsString() + @MaxLength() on all string fields.
ADMIN role must be rejected during self-registration.

### VERIFY:FD-AUTH-004 — JWT Strategy
JwtStrategy must extract JWT from Authorization bearer header.
Must validate token expiration. Must return AuthenticatedUser payload
with userId, email, role, and companyId.

## JWT Payload Structure

```typescript
{
  sub: string;      // User ID
  email: string;    // User email
  role: string;     // User role
  companyId: string; // Tenant ID
}
```

## Security Considerations

- Passwords are never stored in plain text
- BCRYPT_SALT_ROUNDS imported from shared package — never hardcoded
- JWT secret loaded from environment variable — no fallback
- ADMIN role excluded from self-registration
- Token expiry set to 1 hour
