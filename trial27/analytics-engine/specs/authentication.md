# Authentication Specification

## Overview

The Analytics Engine uses JWT-based authentication with bcryptjs password hashing.
Users register with an email, password, name, and tenant name. Login returns a JWT token
that is included in subsequent requests via the Authorization header.

## Registration

### VERIFY: AE-AUTH-001 — Registration with valid data
When a user provides a valid email, password (>= 8 chars), name, and tenant name,
the system creates a new user account and returns a JWT access token.
If the tenant does not exist, it is created automatically.

### VERIFY: AE-AUTH-002 — Registration with duplicate email
When a user attempts to register with an email that already exists in the system,
a 409 Conflict response is returned with the message "Email already registered".

### VERIFY: AE-AUTH-003 — Registration validation
When a user provides invalid data (missing fields, invalid email format, password too short),
a 400 Bad Request response is returned with validation error details.

## Login

### VERIFY: AE-AUTH-004 — Login with valid credentials
When a user provides a valid email and password combination,
the system returns a JWT access token and user details.

### VERIFY: AE-AUTH-005 — Login with invalid password
When a user provides an incorrect password for a valid email,
a 401 Unauthorized response is returned.

### VERIFY: AE-AUTH-006 — Login with nonexistent email
When a user attempts to login with an email not in the system,
a 401 Unauthorized response is returned (same as invalid password for security).

## JWT Token

- Tokens are signed with the JWT_SECRET environment variable
- Token payload contains: sub (userId), email, tenantId
- Tokens expire after 24 hours
- Tokens are passed via `Authorization: Bearer <token>` header

## Password Security

- Passwords are hashed using bcryptjs with 12 salt rounds
- Plain text passwords are never stored or logged
- Password comparison uses constant-time bcrypt.compare

## Protected Routes

All routes except /auth/login, /auth/register, /health, and /health/ready
require a valid JWT token. Requests without a token receive 401 Unauthorized.

## Rate Limiting

The login endpoint has a stricter rate limit of 10 requests per second
to prevent brute force attacks. See [security.md](security.md) for details.

## Cross-References

- Token validation: See [security.md](security.md)
- User data model: See [data-model.md](data-model.md)
- Auth API endpoints: See [api-endpoints.md](api-endpoints.md)
