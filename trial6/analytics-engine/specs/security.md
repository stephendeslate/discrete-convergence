# Security Specification

## Overview

Security is enforced at multiple layers: authentication, authorization,
input validation, rate limiting, and HTTP hardening.

## RBAC

<!-- VERIFY: AE-SEC-005 -->
- Roles: ADMIN, USER, VIEWER
- Roles decorator sets required roles on controller methods
- Role metadata is read by RolesGuard at runtime

<!-- VERIFY: AE-SEC-006 -->
- RolesGuard checks the authenticated user's role against required roles
- If no roles are specified on an endpoint, all authenticated users can access it
- Unauthenticated requests (no user on request) are denied

## Rate Limiting

- ThrottlerModule limits requests to 100 per 60 seconds per client
- Applied globally via APP_GUARD

## Input Validation

- ValidationPipe with whitelist and forbidNonWhitelisted strips unknown properties
- All DTOs use class-validator decorators for field-level validation
- String fields have MaxLength constraints to prevent oversized payloads

## HTTP Hardening

- Helmet middleware sets security-related HTTP headers
- CORS is configured with explicit origin whitelist
- Credentials are allowed for cookie-based auth flow

## Tenant Isolation

- All data queries include tenantId filter from authenticated user context
- Row-Level Security at the database level provides defense-in-depth
- Widget access is verified through dashboard ownership chain

## Sensitive Data

- Passwords are never returned in API responses
- Log sanitizer redacts: password, passwordHash, token, accessToken, secret, authorization
- JWT tokens have short expiry (15m access, 7d refresh)

## Registration Restrictions

- Only USER and VIEWER roles can self-register
- ADMIN role creation requires direct database access or admin API
