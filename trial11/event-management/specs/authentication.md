# Authentication Specification

## Overview

The event-management system uses JWT-based authentication with bcryptjs
password hashing. Registration is limited to safe roles (USER, ORGANIZER)
while ADMIN is assignable only through direct database operations.

## Requirements

### AUTH-001: Password Hashing

- VERIFY: EM-AUTH-001 — BCRYPT_SALT_ROUNDS constant is exported from shared
  package and set to 12 for production-grade security.
- All passwords MUST be hashed before storage using bcryptjs (not bcrypt).

### AUTH-002: JWT Configuration

- VERIFY: EM-AUTH-002 — JWT_EXPIRATION constant is exported from shared and
  used in the JwtModule registration for consistent token lifetimes.
- Tokens encode userId, email, role, and tenantId in the payload.

### AUTH-003: Auth Service

- VERIFY: EM-AUTH-003 — AuthService implements register() and login() methods
  using bcryptjs for hashing and comparison, with proper error handling for
  duplicate emails and invalid credentials.
- Registration checks for existing users via findFirst before creating.
- Login returns a signed JWT access token on success.

### AUTH-004: Auth Controller

- VERIFY: EM-AUTH-004 — AuthController exposes POST /auth/register and
  POST /auth/login endpoints, both decorated with @Public() to bypass
  the global JwtAuthGuard.

### AUTH-005: JWT Strategy

- VERIFY: EM-AUTH-005 — JwtStrategy extracts the token from the
  Authorization Bearer header and validates the payload structure,
  returning the user context for request decoration.

### AUTH-006: Registration DTO

- VERIFY: EM-AUTH-006 — RegisterDto validates the role field using
  @IsIn(ALLOWED_REGISTRATION_ROLES) from the shared package to prevent
  privilege escalation during self-registration.
- Fields: name, email, password, role, tenantId (all required).

### AUTH-007: Login DTO

- VERIFY: EM-AUTH-007 — LoginDto validates email and password fields
  using class-validator decorators (@IsEmail, @IsString, @IsNotEmpty).

## Security Considerations

- Passwords are never stored in plaintext or logged.
- JWT secrets are loaded from environment variables, never hardcoded.
- Token expiration prevents indefinite session persistence.
- Registration role restriction prevents ADMIN self-assignment.

## Test Coverage

- Unit tests verify service methods with mocked Prisma and JWT.
- Integration tests verify full request/response cycle via supertest.
- Security tests verify unauthorized access is rejected with 401.
