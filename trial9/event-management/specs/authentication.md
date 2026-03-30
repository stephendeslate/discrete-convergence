# Authentication Specification

## Overview

The Event Management platform uses JWT-based authentication with bcryptjs for password hashing.
Multi-tenant isolation is enforced through tenant context in JWT tokens.

## Requirements

### Registration

VERIFY: EM-AUTH-001 — Password hashing uses BCRYPT_SALT_ROUNDS from shared package (value: 12)

VERIFY: EM-AUTH-002 — Only ALLOWED_REGISTRATION_ROLES (USER, ORGANIZER) can self-register; ADMIN excluded

VERIFY: EM-AUTH-003 — Public decorator exempts auth and health routes from JWT guard

Users register with email, password, name, role, and tenantId. The system validates:
- Email format and uniqueness
- Role is one of the allowed registration roles
- Password is hashed with bcryptjs using salt rounds from shared constants

### Login

VERIFY: EM-AUTH-005 — Auth module registers JWT with configurable secret and 1-hour expiry

VERIFY: EM-AUTH-006 — Auth service validates credentials and returns JWT access token

Users authenticate with email and password. On success, the API returns:
- `access_token`: JWT containing sub, email, role, and tenantId claims
- `user`: object with id, email, and role

### JWT Strategy

VERIFY: EM-AUTH-007 — JWT strategy extracts token from Authorization Bearer header

VERIFY: EM-AUTH-008 — Register DTO validates email, password, name, role, and tenantId with class-validator

VERIFY: EM-AUTH-009 — Login DTO validates email and password with class-validator

The JWT payload includes:
- `sub`: user ID
- `email`: user email
- `role`: user role (ADMIN, USER, ORGANIZER)
- `tenantId`: tenant identifier for multi-tenant isolation

### JWT Auth Guard

VERIFY: EM-AUTH-004 — Global JwtAuthGuard registered as APP_GUARD, respects @Public() decorator

The guard is registered globally via APP_GUARD in AppModule. Routes decorated with
@Public() are exempt from authentication. The guard returns 401 for missing/invalid tokens.

## Cross-References

- See [security.md](security.md) for RBAC and rate limiting details
- See [data-model.md](data-model.md) for User entity schema
- See [api-endpoints.md](api-endpoints.md) for auth endpoint specifications
