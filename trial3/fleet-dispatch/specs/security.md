# Security Specification

## Overview

Fleet Dispatch implements defense-in-depth security with
JWT authentication, input validation, rate limiting, CSP,
and multi-tenant data isolation.

## Authentication

<!-- VERIFY:FD-SEC-001 — @Public() decorator exempts routes from JwtAuthGuard -->
<!-- VERIFY:FD-SEC-002 — JwtAuthGuard as APP_GUARD checks @Public() metadata -->
<!-- VERIFY:FD-SEC-003 — ALLOWED_REGISTRATION_ROLES excludes ADMIN from registration -->

### JWT Authentication
- JwtAuthGuard registered as APP_GUARD (global)
- Domain controllers do NOT use @UseGuards individually
- @Public() decorator exempts specific routes (auth, health)
- JWT secret from environment variable (no hardcoded fallback)

### Password Security
- bcrypt with BCRYPT_SALT_ROUNDS (12) from shared package
- Passwords never logged (sanitizeLogContext redacts)

## Input Validation

### ValidationPipe
- `whitelist: true` — strips unknown properties
- `forbidNonWhitelisted: true` — rejects unknown properties
- `transform: true` — auto-transforms types

### DTO Validation
- All string fields: @IsString() + @MaxLength()
- All UUID fields: @MaxLength(36)
- Email fields: @IsEmail() + @IsString() + @MaxLength()
- Registration role: @IsIn(ALLOWED_REGISTRATION_ROLES)

## Rate Limiting

<!-- VERIFY:FD-SEC-004 — ThrottlerModule with default (100/min) and auth (5/min) configs -->
<!-- VERIFY:FD-SEC-005 — main.ts uses Helmet CSP, CORS, ValidationPipe, validateEnvVars -->

### Throttler Configuration
- ThrottlerGuard as APP_GUARD
- Default: 100 requests per 60 seconds
- Auth: 5 requests per 60 seconds
- Health endpoints exempt via @SkipThrottle()

## Content Security Policy

Helmet.js CSP directives:
- `default-src: 'self'`
- `script-src: 'self'`
- `style-src: 'self' 'unsafe-inline'`
- `img-src: 'self' data:`
- `frame-ancestors: 'none'`

## CORS

- Origin from CORS_ORIGIN environment variable
- No fallback value (validated at startup)
- credentials: true
- Explicit methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
- Explicit headers: Content-Type, Authorization, X-Correlation-ID

## Multi-Tenant Isolation

- All queries scoped by companyId from JWT
- Row Level Security on all tables
- No cross-tenant data access possible
- Composite unique constraints prevent cross-company conflicts

## Convention Gates

Binary security conventions enforced:
- Zero `as any` type assertions
- Zero `console.log` in API source
- Zero `|| 'value'` env var fallback patterns
- Zero `$executeRawUnsafe`
- Zero `dangerouslySetInnerHTML`

## Audit Trail

- AuditLog entity records all state changes
- Immutable entries (no update/delete via API)
- Stores entityType, entityId, action, changes JSON, performedBy
