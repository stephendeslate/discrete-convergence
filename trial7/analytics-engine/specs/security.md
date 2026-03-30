# Security Specification

## Overview

The Analytics Engine implements defense-in-depth security with global guards,
rate limiting, input validation, CSP headers, and error sanitization.
See [authentication.md](authentication.md) for auth flow details.

## Global Guards (APP_GUARD)

Three global guards registered via APP_GUARD in AppModule:
1. ThrottlerGuard — rate limiting
2. JwtAuthGuard — JWT authentication
3. RolesGuard — role-based access control

- VERIFY: AE-SEC-001 — @Public() decorator exempts routes from JWT authentication
- VERIFY: AE-SEC-002 — @Roles() decorator enforces role-based access on endpoints
- VERIFY: AE-SEC-003 — RolesGuard checks JWT role against required roles metadata

## Error Sanitization

- VERIFY: AE-SEC-004 — GlobalExceptionFilter sanitizes errors, includes correlationId, never leaks stack traces

The GlobalExceptionFilter:
- Catches all exceptions (including unhandled)
- Returns sanitized error response with statusCode, message, correlationId, timestamp
- Never includes stack traces or internal error details
- Logs full error details via Pino logger
- Sanitizes request body via sanitizeLogContext before logging

## Helmet CSP

Content Security Policy headers via Helmet.js:
- default-src: 'self'
- script-src: 'self'
- style-src: 'self' 'unsafe-inline'
- img-src: 'self' data:
- frame-ancestors: 'none'

## Rate Limiting

ThrottlerModule with two named configurations:
- 'default': 100 requests per 60 seconds
- 'auth': 5 requests per 60 seconds
ThrottlerGuard registered as APP_GUARD.
Health and metrics endpoints skip throttling via @SkipThrottle().

## CORS

Configured in main.ts:
- Origin from CORS_ORIGIN env (no fallback)
- Credentials: true
- Allowed headers: Content-Type, Authorization, X-Correlation-ID
- Allowed methods: GET, POST, PUT, DELETE, PATCH, OPTIONS

## Input Validation

Global ValidationPipe with:
- whitelist: true (strips unknown properties)
- forbidNonWhitelisted: true (rejects requests with extra fields)
- transform: true (auto-transforms types)

All DTOs use class-validator decorators:
- @IsString() + @MaxLength() on all string fields
- @IsEmail() on email fields
- @MaxLength(36) on UUID fields
- @IsIn() for enum values
- @IsIn(ALLOWED_REGISTRATION_ROLES) on registration role

## Row Level Security

All database tables have:
- ENABLE ROW LEVEL SECURITY
- FORCE ROW LEVEL SECURITY
Enforced in the migration SQL to prevent direct DB access bypass.

## Dependency Audit

pnpm audit --audit-level=high runs in CI.
Zero critical and zero high vulnerabilities required.
