# Security Specification

## Overview

The Event Management platform implements defense-in-depth security
through authentication guards, request validation, rate limiting,
Content Security Policy, CORS, and error sanitization.

## Authentication Architecture

<!-- VERIFY:EM-SEC-001 — JwtAuthGuard as APP_GUARD with @Public() exemption -->
- `JwtAuthGuard` registered as `APP_GUARD` in AppModule
- All endpoints require authentication by default
- `@Public()` decorator exempts specific routes (health, auth)
- Domain controllers do NOT use `@UseGuards(JwtAuthGuard)` — global guard handles it

## Rate Limiting

<!-- VERIFY:EM-SEC-002 — ThrottlerModule with default and auth named configs -->
ThrottlerModule configured with two named rate limit profiles:
- `default`: 100 requests per 60 seconds
- `auth`: 5 requests per 60 seconds (login/register)
- `ThrottlerGuard` registered as `APP_GUARD`
- Health endpoints use `@SkipThrottle()` to bypass rate limiting

## Content Security Policy

<!-- VERIFY:EM-SEC-003 — main.ts validates env vars, configures Helmet CSP, CORS, ValidationPipe -->
Helmet.js configured with CSP directives:
- `default-src 'self'`
- `script-src 'self'`
- `style-src 'self' 'unsafe-inline'`
- `img-src 'self' data:`
- `frame-ancestors 'none'`

## CORS

- Origin from `CORS_ORIGIN` environment variable
- No fallback origin value
- Credentials enabled
- Explicit methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
- Explicit headers: Content-Type, Authorization, X-Correlation-ID

## Request Validation

ValidationPipe configured with:
- `whitelist: true` — strips unknown properties
- `forbidNonWhitelisted: true` — rejects unknown properties
- `transform: true` — enables type transformation

## DTO Security

- All string fields: `@IsString()` + `@MaxLength()`
- UUID fields: `@MaxLength(36)` to prevent oversized inputs
- Email fields: `@IsEmail()` for format validation
- Registration role: `@IsIn(ALLOWED_REGISTRATION_ROLES)` — ADMIN excluded

## Error Handling

- `GlobalExceptionFilter` sanitizes all error responses
- No stack traces exposed to clients
- `sanitizeLogContext` redacts sensitive fields from logs
- Correlation ID included in error response body

## Environment Security

- All required env vars validated at startup via `validateEnvVars()`
- No hardcoded secret fallbacks
- JWT secret from environment only
- CORS origin from environment only

## Binary Convention Gates

- Zero `as any` type assertions
- Zero `console.log` in `apps/api/src/`
- Zero `|| 'value'` fallback patterns
- Zero `$executeRawUnsafe`
- Zero `dangerouslySetInnerHTML`

## Cross-References

- See [authentication.md](authentication.md) for auth flow details
- See [monitoring.md](monitoring.md) for error sanitization implementation
