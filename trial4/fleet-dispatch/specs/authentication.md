# Authentication Specification

## Overview

Fleet Dispatch uses JWT-based authentication with bcrypt password hashing. The auth
system supports registration with role enforcement, login with credential validation,
and JWT token issuance for subsequent API requests.

## Requirements

### VERIFY:FD-AUT-001 — JWT + bcrypt authentication

The AuthService must handle login and registration using JWT tokens for session
management and bcrypt for password hashing. BCRYPT_SALT_ROUNDS must be imported
from the shared package (value: 12). No hardcoded salt rounds in service code.

### VERIFY:FD-AUT-002 — Auth controller with @Public() exemption

Auth endpoints (POST /auth/login, POST /auth/register) must be decorated with
@Public() to exempt them from the global JwtAuthGuard. Without this decorator,
unauthenticated users cannot register or log in.

### VERIFY:FD-AUT-003 — Registration enforces ALLOWED_REGISTRATION_ROLES

The registration endpoint must validate the role field against ALLOWED_REGISTRATION_ROLES
imported from the shared package. ADMIN role must be excluded from self-registration.
Only DISPATCHER, TECHNICIAN, and CUSTOMER roles are permitted.

### VERIFY:FD-AUT-004 — Registration DTO with validation decorators

The RegisterDto must include class-validator decorators: @IsEmail() + @IsString() +
@MaxLength() on email, @IsString() + @MaxLength() on password, @IsIn(ALLOWED_REGISTRATION_ROLES)
on role, and @IsOptional() + @IsString() + @MaxLength(36) on companyId.

### VERIFY:FD-AUT-005 — Auth integration tests with real AppModule

Integration tests must compile the real AppModule, use supertest for HTTP requests,
and verify: ADMIN role rejection, invalid email rejection, missing field rejection,
wrong credential rejection. Tests must import BCRYPT_SALT_ROUNDS from shared.

## Token Structure

JWT payload contains: sub (userId), email, role, companyId.
Token expiry: 24 hours. Secret from JWT_SECRET environment variable.

## Password Security

- bcrypt with 12 salt rounds (from shared constant)
- Passwords never stored in plaintext
- Passwords never returned in API responses

## Related Specifications

- See [security.md](security.md) for JWT strategy and guard configuration
- See [data-model.md](data-model.md) for User model schema
- See [api-endpoints.md](api-endpoints.md) for endpoint definitions
