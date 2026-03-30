# Security Specification

## Overview

The Event Management Platform implements defense-in-depth security with JWT
authentication, role-based access control, input validation, rate limiting,
security headers, and database-level row isolation.

## Authentication Guard

VERIFY: EM-SEC-001 — @Public() decorator marks endpoints that skip JWT validation

The JwtAuthGuard is registered as a global APP_GUARD. It checks for the
@Public() decorator via the Reflector — public endpoints (health, auth) bypass
JWT validation. All other endpoints require a valid Bearer token.

VERIFY: EM-SEC-005 — JwtAuthGuard checks IS_PUBLIC_KEY in reflector

## Role-Based Access Control

VERIFY: EM-SEC-002 — @Roles() decorator sets required roles metadata
VERIFY: EM-SEC-003 — RolesGuard rejects users without required role

The RolesGuard checks the @Roles() decorator metadata against req.user.role.
If no @Roles() decorator is present, the endpoint is open to any authenticated
user. If roles are specified, only users with matching roles are allowed.

Role hierarchy: ADMIN > EDITOR > VIEWER
- ADMIN: full CRUD access
- EDITOR: create and update, no delete
- VIEWER: read-only access

See: api-endpoints.md for role requirements per endpoint
See: authentication.md for role in JWT payload

## Input Validation

ValidationPipe is configured globally with:
- whitelist: true — strips unknown properties
- forbidNonWhitelisted: true — rejects requests with unknown properties
- transform: true — auto-transforms query parameters to correct types

DTOs use class-validator decorators (@IsEmail, @IsString, @IsIn, etc.)
to enforce input constraints before reaching the service layer.

## Rate Limiting

ThrottlerModule provides three tiers:
- short: 100 requests per second (supports load testing)
- medium: 500 requests per 10 seconds
- long: 2000 requests per minute

Auth endpoints have tighter limits:
- login: 10 requests per second
- register: 10 requests per second

Health endpoints are NOT exempt from throttling — they use the default limits.

## Security Headers

VERIFY: EM-SEC-004 — GlobalExceptionFilter includes correlationId in error responses

Helmet middleware provides:
- Content-Security-Policy with frame-ancestors: 'none'
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Strict-Transport-Security (in production)

The Express x-powered-by header is explicitly disabled.

See: monitoring.md for correlation IDs in error responses
See: cross-layer.md for header verification tests

## CORS

CORS is configured with the CORS_ORIGIN environment variable.
Only the specified origin is allowed for cross-origin requests.

## Database Security

Row-Level Security (RLS) provides tenant isolation at the database level.
See: data-model.md for RLS policy details.

## Dependency Security

- bcryptjs used instead of bcrypt (avoids native compilation vulnerabilities)
- pnpm.overrides for effect>=3.20.0 (Prisma transitive vulnerability)
- pnpm audit runs in CI pipeline

See: infrastructure.md for CI audit configuration
