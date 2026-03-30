# Security Specification

## Overview

The Analytics Engine implements defense-in-depth security with Helmet.js CSP,
rate limiting via ThrottlerModule, CORS restrictions, input validation,
and environment variable validation. See [authentication.md](authentication.md)
for the auth module design.

## Content Security Policy

Helmet.js is configured in main.ts with strict CSP directives:
- default-src: 'self'
- script-src: 'self'
- style-src: 'self' 'unsafe-inline'
- img-src: 'self' data:
- frame-ancestors: 'none'

This prevents XSS, clickjacking, and unauthorized resource loading.

## Rate Limiting

ThrottlerModule is configured with two named rate limit configs:
- default: 100 requests per 60 seconds
- auth: 5 requests per 60 seconds (for login/register endpoints)

ThrottlerGuard is registered as APP_GUARD in AppModule providers.

## JWT Security

The JWT strategy loads the secret from environment with no fallback value.
See [authentication.md](authentication.md) for JWT implementation details.

- VERIFY:AE-SEC-001 — JWT strategy uses process.env.JWT_SECRET with
  no hardcoded fallback

## Throttler Configuration

The ThrottlerModule uses named configurations for differentiated rate limits.
Both configurations are registered in AppModule imports.

- VERIFY:AE-SEC-002 — ThrottlerGuard as APP_GUARD with default and auth
  named rate limit configurations

## Application Security

The application bootstrap configures Helmet CSP, CORS, and ValidationPipe.
CORS origin is loaded from CORS_ORIGIN environment variable with no fallback.
ValidationPipe uses whitelist + forbidNonWhitelisted + transform.

- VERIFY:AE-SEC-003 — Main.ts configures Helmet CSP, CORS from env (no fallback),
  and ValidationPipe with whitelist + forbidNonWhitelisted + transform

## Input Validation

All DTOs use class-validator decorators for input sanitization:
- @IsString() + @MaxLength() on all string fields
- @IsEmail() on email fields
- @IsIn() for enum validation
- @MaxLength(36) on UUID fields
- forbidNonWhitelisted rejects unknown properties

## CORS Configuration

CORS is configured with:
- origin: from CORS_ORIGIN env var
- credentials: true
- methods: GET, POST, PATCH, DELETE, OPTIONS
- allowedHeaders: Content-Type, Authorization, X-Correlation-ID

## Convention Gates

Binary security gates enforced in the codebase:
- Zero `as any` type assertions
- Zero `console.log` in apps/api/src/
- Zero `|| 'value'` env var fallback patterns
- Zero `$executeRawUnsafe` calls
- Zero `dangerouslySetInnerHTML` usage

## Monitoring Integration

See [monitoring.md](monitoring.md) for correlation ID tracking and
request logging that supports security audit trails.
