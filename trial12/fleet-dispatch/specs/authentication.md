# Authentication Specification

## Overview

Fleet Dispatch uses JWT-based authentication with bcryptjs password hashing.
All API endpoints except monitoring and auth routes require a valid Bearer token.
Authentication is enforced globally via APP_GUARD pattern.

## Requirements

### User Registration

- VERIFY: FD-AUTH-001
  Users can register with email, password, name, role, and tenantId.
  Only roles in ALLOWED_REGISTRATION_ROLES from shared package are accepted.
  Password is hashed with bcryptjs using BCRYPT_SALT_ROUNDS from shared.

- VERIFY: FD-AUTH-002
  Registration validates all input fields using class-validator decorators.
  Email must be a valid email format. Password must be a non-empty string.
  Role must be one of the allowed registration roles.

- VERIFY: FD-AUTH-003
  Duplicate email registration returns a 409 Conflict response.
  The system checks for existing users via findFirst before creating.

### User Login

- VERIFY: FD-AUTH-004
  Login accepts email and password, verifies credentials against stored hash.
  On success, returns a JWT access_token signed with JWT_SECRET.

- VERIFY: FD-AUTH-005
  Login with invalid credentials returns 401 Unauthorized.
  The error message must not reveal whether email or password was wrong.

### JWT Strategy

- VERIFY: FD-AUTH-006
  JWT tokens are extracted from Authorization Bearer header.
  Strategy validates token signature and extracts userId, email, role, tenantId.

- VERIFY: FD-AUTH-007
  Expired or malformed tokens are rejected with 401 Unauthorized.
  The JwtAuthGuard respects @Public() decorator to skip authentication.

### Token Storage (Frontend)

- VERIFY: FD-AUTH-008
  After successful login, the frontend stores the JWT token via cookies().set().
  Subsequent server actions read the token and send Authorization: Bearer headers.

## Cross-References

- See [security.md](security.md) for global guard configuration
- See [api-endpoints.md](api-endpoints.md) for auth route definitions
- See [frontend.md](frontend.md) for login page and token handling
