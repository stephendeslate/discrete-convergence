# Security Specification

## Overview

The event management platform implements defense-in-depth security with multiple layers:
authentication, authorization, input validation, rate limiting, CSP headers, and
database-level tenant isolation via Row Level Security.

## Authentication Guard

Global JwtAuthGuard registered as APP_GUARD protects all endpoints by default.
Routes marked with @Public() decorator are exempt from JWT verification.

- VERIFY: EM-SEC-001 — @Public decorator sets IS_PUBLIC_KEY metadata
- VERIFY: EM-SEC-002 — @Roles decorator sets ROLES_KEY metadata for RBAC
- VERIFY: EM-SEC-003 — RolesGuard checks JWT role against required roles
- VERIFY: EM-SEC-004 — JwtStrategy extracts token from Bearer header, validates with secret
- VERIFY: EM-SEC-005 — JwtAuthGuard checks @Public metadata before requiring auth

## Rate Limiting

ThrottlerModule configured with two named rate limit configurations:
- `default`: 100 requests per 60 seconds (general API)
- `auth`: 5 requests per 60 seconds (authentication endpoints)

ThrottlerGuard registered as APP_GUARD applies rate limiting globally.
Health and metrics endpoints use @SkipThrottle() to exempt from limits.

## Helmet CSP

Helmet middleware configured in main.ts with Content Security Policy:
- `default-src: 'self'`
- `script-src: 'self'`
- `style-src: 'self' 'unsafe-inline'`
- `img-src: 'self' data:`
- `frame-ancestors: 'none'`

## CORS Configuration

CORS enabled via app.enableCors() with:
- Origin from CORS_ORIGIN environment variable (no fallback)
- Credentials: true
- Explicit methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
- Explicit headers: Content-Type, Authorization, X-Correlation-ID

## Input Validation

ValidationPipe configured globally with:
- `whitelist: true` — strips unknown properties
- `forbidNonWhitelisted: true` — rejects unknown properties
- `transform: true` — auto-transforms payloads to DTO instances

All DTOs use class-validator decorators: @IsString, @IsEmail, @MaxLength, @IsIn, etc.
UUID fields use @MaxLength(36). Registration role uses @IsIn(ALLOWED_REGISTRATION_ROLES).

## Error Handling

GlobalExceptionFilter registered as APP_FILTER:
- Sanitizes error responses (no stack traces)
- Includes correlationId in response body
- Uses sanitizeLogContext for request body logging
- Returns consistent JSON error format

## Cross-References

- See [authentication.md](authentication.md) for auth flow details
- See [data-model.md](data-model.md) for RLS policy configuration
- See [monitoring.md](monitoring.md) for error logging and correlation IDs
- See [infrastructure.md](infrastructure.md) for audit pipeline
