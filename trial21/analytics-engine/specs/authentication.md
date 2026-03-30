# Authentication Specification

## Overview

The analytics engine uses JWT-based authentication with access and refresh tokens.
Authentication is handled by the NestJS API backend with Passport.js integration.

Cross-reference: See [security.md](security.md) for security hardening details.
Cross-reference: See [api-endpoints.md](api-endpoints.md) for endpoint specifications.

## VERIFY Tags

VERIFY: AE-AUTH-001 — registration role restrictions (ADMIN excluded from self-registration)
VERIFY: AE-AUTH-002 — login DTO validation with email and password constraints
VERIFY: AE-AUTH-003 — registration DTO with role restriction via @IsIn(ALLOWED_REGISTRATION_ROLES)
VERIFY: AE-AUTH-004 — JWT access token expiry capped at 1 hour
VERIFY: AE-AUTH-005 — password hashing with bcryptjs (not bcrypt native)
VERIFY: AE-AUTH-006 — JWT strategy extracts bearer token from Authorization header
VERIFY: AE-AUTH-007 — auth endpoints are public with rate limiting via @Throttle

## Authentication Flow

1. User submits credentials (email + password)
2. Server validates credentials against hashed password
3. Server issues JWT access token (1h expiry) and refresh token (7d expiry)
4. Client stores tokens securely (httpOnly cookies in SSR context)
5. Subsequent requests include Bearer token in Authorization header

## Token Structure

Access tokens contain:
- `sub`: User ID
- `email`: User email
- `role`: User role (ADMIN, USER, VIEWER)
- `tenantId`: Tenant ID for multi-tenant scoping

## Registration Rules

- Only USER and VIEWER roles are allowed during self-registration
- ADMIN accounts must be created by existing ADMINs
- Email uniqueness is enforced at the database level
- Passwords must be at least 8 characters

## Password Security

- Passwords are hashed using bcryptjs with 12 salt rounds
- Plain text passwords are never stored or logged
- Password comparison uses constant-time comparison via bcrypt

## Rate Limiting

- Login endpoint: 10 requests per second (short window)
- Registration endpoint: 10 requests per second (short window)
- Refresh endpoint: standard rate limits apply

## Edge Cases

VERIFY: AE-AUTH-008 — duplicate email registration returns 409 Conflict
VERIFY: AE-AUTH-009 — invalid refresh token returns 401 Unauthorized
VERIFY: AE-AUTH-010 — empty password rejected by validation pipe
VERIFY: AE-AUTH-011 — malformed email rejected by @IsEmail validator
VERIFY: AE-AUTH-012 — expired access token returns 401 on protected endpoints
