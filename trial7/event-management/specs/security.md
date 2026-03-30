# Security Specification

## Overview

The Event Management platform implements defense-in-depth security with global
authentication guards, role-based access control, input validation, rate limiting,
CSP headers, and error sanitization.

See also: [authentication.md](authentication.md) for JWT auth details.
See also: [monitoring.md](monitoring.md) for error handling and logging.

## Public Route Decorator

- VERIFY: EM-SEC-001 — @Public() decorator sets IS_PUBLIC_KEY metadata to bypass
  JwtAuthGuard on specific routes (health, auth endpoints)

## Role-Based Access Control

- VERIFY: EM-SEC-002 — @Roles() decorator sets ROLES_KEY metadata for endpoint-level
  role requirements (e.g., ADMIN, ORGANIZER)
- VERIFY: EM-SEC-003 — RolesGuard reads @Roles() metadata via Reflector, checks
  request.user.role against required roles, returns false if unauthorized
- VERIFY: EM-SEC-005 — Event stats endpoint requires ADMIN role via @Roles('ADMIN'),
  event deletion requires ADMIN or ORGANIZER

## JWT Authentication Guard

- VERIFY: EM-SEC-004 — JwtAuthGuard extends AuthGuard('jwt'), checks IS_PUBLIC_KEY
  metadata to allow public routes, throws UnauthorizedException for missing/invalid tokens

## Global Security Setup

- VERIFY: EM-SEC-006 — AppModule registers ThrottlerGuard, JwtAuthGuard, and
  RolesGuard as APP_GUARD providers in the correct order
- ThrottlerModule configured with two named rate limits:
  - default: 100 requests per 60 seconds
  - auth: 5 requests per 60 seconds

## Helmet CSP

- VERIFY: EM-SEC-007 — main.ts configures Helmet with Content Security Policy:
  default-src 'self', script-src 'self', style-src 'self' 'unsafe-inline',
  img-src 'self' data:, frame-ancestors 'none'

## Validation

- VERIFY: EM-SEC-008 — main.ts configures global ValidationPipe with whitelist: true,
  forbidNonWhitelisted: true, and transform: true to reject unknown fields

## CORS Configuration

- CORS origin from CORS_ORIGIN environment variable (no hardcoded fallback)
- credentials: true
- Explicit allowedHeaders: Content-Type, Authorization, X-Correlation-ID
- Explicit methods: GET, POST, PUT, DELETE, PATCH, OPTIONS

## Input Validation Rules

All DTOs use class-validator decorators:
- String fields: @IsString() + @MaxLength()
- UUID fields: @MaxLength(36)
- Email fields: @IsEmail() + @IsString() + @MaxLength()
- Enum fields: @IsIn([...values])
- Number fields: @IsNumber() or @IsInt() with @Min()
- Optional fields: @IsOptional()
- Registration role: @IsIn(ALLOWED_REGISTRATION_ROLES) — ADMIN excluded

## Dependency Audit

- pnpm audit --audit-level=high runs in CI
- 0 critical + 0 high vulnerabilities required
- Documented in .github/workflows/ci.yml audit step

## Convention Gates
- Zero `as any` type assertions
- Zero `console.log` in apps/api/src/
- Zero `|| 'value'` env var fallbacks
- Zero `$executeRawUnsafe`
- Zero `dangerouslySetInnerHTML`
