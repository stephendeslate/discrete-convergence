# Authentication Specification

## Overview

The Analytics Engine uses JWT-based authentication with bcryptjs password hashing.
Users register with an email, password, name, role, and tenantId. Login returns a
JWT access token for subsequent authenticated requests.

See also: [Security Specification](security.md) for guards and rate limiting.
See also: [API Endpoints](api-endpoints.md) for route definitions.

## User Roles

- **ADMIN** — full access, can manage data sources and delete dashboards
- **USER** — standard access, can create and manage own dashboards
- **VIEWER** — read-only access to dashboards and widgets

Registration is restricted to roles defined in ALLOWED_REGISTRATION_ROLES from the
shared package. ADMIN role is excluded from self-registration.

## Requirements

### Registration

- VERIFY: AE-AUTH-001 — Password hashing uses BCRYPT_SALT_ROUNDS from shared package
- VERIFY: AE-AUTH-002 — Registration restricted to ALLOWED_REGISTRATION_ROLES (ADMIN excluded)
- VERIFY: AE-AUTH-003 — Auth module uses JWT with configurable secret from environment
- VERIFY: AE-AUTH-004 — Auth service handles registration with duplicate email detection
- VERIFY: AE-AUTH-005 — Auth controller exposes public register and login endpoints
- VERIFY: AE-AUTH-006 — Register DTO validates email, password, name, role with class-validator

### Login

- VERIFY: AE-AUTH-007 — Login DTO validates email and password with class-validator
- VERIFY: AE-AUTH-008 — JWT strategy extracts and validates token from Authorization header

### Token Structure

The JWT payload contains:
- `sub` — user ID
- `email` — user email
- `role` — user role (ADMIN, USER, VIEWER)
- `tenantId` — tenant identifier for multi-tenant isolation

### Password Security

- Passwords are hashed with bcryptjs using 12 salt rounds
- Raw passwords are never stored or returned in responses
- Password comparison uses bcrypt.compare for timing-safe comparison

### Error Handling

- Invalid credentials return 401 Unauthorized
- Duplicate email returns 409 Conflict
- Missing required fields return 400 Bad Request
- Invalid role returns 400 Bad Request
