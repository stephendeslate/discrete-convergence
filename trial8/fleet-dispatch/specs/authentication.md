# Authentication Specification

## Overview
Authentication for Fleet Dispatch uses JWT tokens with bcrypt password hashing.
Registration is restricted to non-admin roles per ALLOWED_REGISTRATION_ROLES.

## Endpoints

### POST /auth/login
- Public endpoint (no auth required)
- Rate limited: 5 requests per minute
- Validates email and password
- Returns JWT access_token on success
- VERIFY: FD-AUTH-001 - Login rejects missing fields
- VERIFY: FD-AUTH-002 - Login rejects invalid email format
- VERIFY: FD-AUTH-005 - Login rejects extra fields (forbidNonWhitelisted)

### POST /auth/register
- Public endpoint (no auth required)
- Rate limited: 5 requests per minute
- Validates email, password, role, tenantId
- Role must be in ALLOWED_REGISTRATION_ROLES (USER, DISPATCHER only)
- VERIFY: FD-AUTH-003 - Registration rejects ADMIN role
- VERIFY: FD-AUTH-004 - Registration rejects short password
- VERIFY: FD-AUTH-012 - Registration creates user and returns token

## Token Structure
- sub: user ID
- email: user email
- role: user role (ADMIN, USER, DISPATCHER)
- tenantId: tenant identifier
- Expiry: 24 hours

## Password Security
- Hashed with bcrypt using BCRYPT_SALT_ROUNDS (12) from shared package
- VERIFY: FD-AUTH-009 - Login succeeds with valid credentials
- VERIFY: FD-AUTH-010 - Login fails for non-existent user
- VERIFY: FD-AUTH-011 - Login fails for wrong password
- VERIFY: FD-AUTH-013 - Registration fails for duplicate email

## Frontend Integration
- Login action stores token in httpOnly secure cookie
- VERIFY: FD-AUTH-014 - Login action sets cookie and redirects
- VERIFY: FD-AUTH-015 - Register action sets cookie and redirects

## Guards
- JwtAuthGuard: global APP_GUARD, validates JWT on all non-@Public routes
- VERIFY: FD-AUTH-006 - Expired/invalid token returns 401
- VERIFY: FD-AUTH-007 - Missing token returns 401
- VERIFY: FD-AUTH-008 - Public health endpoint works without token

## JWT Strategy
- Extracts token from Authorization Bearer header
- Secret key from JWT_SECRET environment variable
- Token expiration validation enabled (ignoreExpiration: false)

## Cross-References
- See [security.md](security.md) for guard configuration details
- See [infrastructure.md](infrastructure.md) for JWT_SECRET env configuration
