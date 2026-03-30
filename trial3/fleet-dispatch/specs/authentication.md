# Authentication Specification

## Overview

Fleet Dispatch uses JWT-based authentication with bcrypt password hashing.
Multi-tenant authentication isolates users by company. See [security.md](security.md)
for security hardening details.

## Authentication Flow

### Registration

Users register with email, password, name, role, and companyId.
The system hashes the password with bcrypt (salt rounds from shared constants)
and returns a JWT access token.

<!-- VERIFY:FD-AUTH-001 — AuthService handles registration with bcrypt hashing -->
<!-- VERIFY:FD-AUTH-002 — AuthController exposes /auth/register and /auth/login as @Public() -->
<!-- VERIFY:FD-AUTH-003 — JwtStrategy validates JWT and extracts user payload -->
<!-- VERIFY:FD-AUTH-004 — RegisterDto uses @IsIn(ALLOWED_REGISTRATION_ROLES) to exclude ADMIN -->

### Login

Users login with email, password, and companyId. The system verifies
credentials against the database and returns a JWT token.

### JWT Token Structure

The JWT payload contains:
- `sub` — User ID
- `email` — User email address
- `role` — User role (ADMIN, DISPATCHER, TECHNICIAN, CUSTOMER)
- `companyId` — Tenant identifier for multi-tenant isolation

### Password Security

- Passwords hashed with bcrypt
- Salt rounds imported from `@fleet-dispatch/shared` (`BCRYPT_SALT_ROUNDS = 12`)
- No plaintext password storage
- Password field redacted in all logs

### Multi-Tenant Isolation

Each login/register operation is scoped by companyId.
Users can only authenticate within their own company context.
The JWT token carries companyId for downstream tenant scoping.

## Role-Based Access

| Role | Registration | Description |
|------|-------------|-------------|
| ADMIN | Not allowed via registration | Created by seed or direct DB |
| DISPATCHER | Allowed | Manages work orders, assigns technicians |
| TECHNICIAN | Allowed | Receives assignments, updates status |
| CUSTOMER | Allowed | Views work orders, receives invoices |

## Token Management

- Tokens expire after 24 hours
- No refresh token flow in current implementation
- Token validated on every protected request via JwtAuthGuard

## Error Handling

- Invalid credentials: 401 Unauthorized
- Duplicate email in same company: 409 Conflict
- Missing fields: 400 Bad Request (ValidationPipe)
- Expired token: 401 Unauthorized
