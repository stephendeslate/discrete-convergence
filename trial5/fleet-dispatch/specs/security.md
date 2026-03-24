# FD-SPEC-007: Security

## Overview
Fleet Dispatch implements defense-in-depth security: authentication, authorization,
input validation, rate limiting, and HTTP security headers.

## Authentication
- JWT Bearer tokens via Passport.js
- Global JwtAuthGuard applied as APP_GUARD
- @Public() decorator bypasses auth for specific endpoints

<!-- VERIFY:FD-SEC-001 — @Public() sets IS_PUBLIC_KEY metadata -->
<!-- VERIFY:FD-SEC-003 — JwtAuthGuard checks IS_PUBLIC_KEY before requiring auth -->

## Authorization (RBAC)
- Three roles: ADMIN, DISPATCHER, DRIVER
- @Roles() decorator specifies required roles per endpoint
- Global RolesGuard applied as APP_GUARD
- No roles specified = any authenticated user allowed

<!-- VERIFY:FD-SEC-002 — @Roles() sets ROLES_KEY metadata -->
<!-- VERIFY:FD-SEC-004 — RolesGuard checks user.role against required roles -->

## Tenant Isolation
- All domain queries scoped by tenantId from JWT
- @TenantId() param decorator extracts from request user
- Cross-tenant access prevented at service layer (findUnique + tenantId check)

## Input Validation
- ValidationPipe with whitelist + forbidNonWhitelisted
- class-validator decorators on all DTOs
- UUIDs validated via ParseUUIDPipe on path params

## Rate Limiting
- @nestjs/throttler with 100 requests per 60 seconds
- Applied globally via ThrottlerGuard APP_GUARD

## HTTP Security Headers
- Helmet middleware applied in bootstrap
- CORS restricted to configured origin

## Log Sanitization
- Sensitive fields (password, token, secret, authorization) redacted in logs
- Error responses never leak internal details

<!-- VERIFY:FD-MON-004 — log sanitizer redacts sensitive keys -->

## Self-Registration Restrictions
- Only DISPATCHER and DRIVER roles allowed via self-registration
- ADMIN creation restricted to seed/direct access

<!-- VERIFY:FD-AUTH-002 — ALLOWED_REGISTRATION_ROLES excludes ADMIN -->
