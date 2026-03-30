# Authentication Specification

> **Cross-references:** See [security.md](security.md), [data-model.md](data-model.md), [api-endpoints.md](api-endpoints.md), [monitoring.md](monitoring.md)

## Overview

Fleet Dispatch uses JWT-based authentication with bcrypt password hashing.
Authentication is enforced globally via APP_GUARD, with @Public() decorator
exempting specific endpoints (login, register, health checks).

## Authentication Service

### JWT + bcrypt
- VERIFY:FD-AUTH-001 — JWT + bcrypt authentication service
- JwtService from @nestjs/jwt signs tokens with configurable JWT_SECRET
- Tokens include: sub (userId), email, role, companyId
- Token extraction: Bearer token from Authorization header

### Password Hashing
- VERIFY:FD-AUTH-002 — bcrypt password hashing with shared BCRYPT_SALT_ROUNDS
- BCRYPT_SALT_ROUNDS = 12 from @fleet-dispatch/shared constants
- Used in both register (hash) and login (compare) flows

### Auth Controller
- VERIFY:FD-AUTH-003 — Auth controller with @Public() decorator for login/register
- POST /auth/register — creates user, returns accessToken
- POST /auth/login — validates credentials, returns accessToken
- Both endpoints decorated with @Public() to bypass JwtAuthGuard

### Registration DTO
- VERIFY:FD-AUTH-004 — Registration DTO with ALLOWED_REGISTRATION_ROLES validation
- ALLOWED_REGISTRATION_ROLES from shared: ['DISPATCHER', 'TECHNICIAN', 'CUSTOMER']
- Excludes ADMIN role from self-registration
- class-validator decorators enforce email, password length, name constraints

### JWT Strategy
- VERIFY:FD-AUTH-005 — JWT strategy extracting Bearer token from Authorization header
- PassportStrategy(Strategy) with ExtractJwt.fromAuthHeaderAsBearerToken()
- Validates token and returns payload with userId, email, role, companyId

### Auth Utilities
- VERIFY:FD-AUTH-010 — Shared helper to extract companyId from authenticated request
- VERIFY:FD-AUTH-011 — @CompanyId() parameter decorator extracts tenant ID from JWT

## Multi-Tenant Isolation

Every authenticated request includes companyId in the JWT payload.
All service methods receive companyId as their first parameter and filter queries accordingly.
findUnique calls verify companyId match before returning data.
findFirst calls have justification comments explaining why findUnique is insufficient.

## Token Lifecycle

JWT tokens are signed with the JWT_SECRET environment variable.
Token payload includes sub (user ID), email, role, and companyId.
Tokens are stateless — no server-side session storage.
Token expiration is configured via JwtModule.register() in AuthModule.
Expired tokens result in 401 Unauthorized from JwtAuthGuard.

## Error Responses

- 409 Conflict: email already registered for the company
- 401 Unauthorized: invalid credentials (login) or missing/expired JWT
- 400 Bad Request: validation failures (missing fields, invalid role)

## Cross-References

- Global guard registration: see cross-layer.md (FD-CL-001, FD-CL-003)
- Security configuration: see security.md (FD-SEC-003)
- Integration tests: see cross-layer.md (FD-TEST-004)
- Rate limiting on auth: see security.md (FD-SEC-002)
