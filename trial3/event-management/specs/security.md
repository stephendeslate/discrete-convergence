# Security Specification

## Overview

The Event Management platform implements defense-in-depth security including
Helmet.js CSP, rate limiting, CORS, input validation, and Row Level Security.
See [authentication.md](authentication.md) for JWT auth details.

## Requirements

### VERIFY:EM-ARCH-001
AppModule must register global providers via NestJS DI:
- APP_GUARD: ThrottlerGuard (rate limiting)
- APP_GUARD: JwtAuthGuard (authentication)
- APP_FILTER: GlobalExceptionFilter (error handling)
- APP_INTERCEPTOR: ResponseTimeInterceptor (performance)
ThrottlerModule must have BOTH named configs: default (ttl:60000, limit:100) and auth (ttl:60000, limit:5).

### VERIFY:EM-ARCH-002
main.ts must call validateEnvVars() from shared with required env vars.
Helmet CSP must include: defaultSrc 'self', scriptSrc 'self', styleSrc 'self' 'unsafe-inline',
imgSrc 'self' data:, frameAncestors 'none'.
CORS must use CORS_ORIGIN env (no fallback), credentials true, explicit methods and headers.
ValidationPipe must use whitelist + forbidNonWhitelisted + transform.

## Content Security Policy

Helmet.js is configured with strict CSP directives:
- default-src: 'self' — only same-origin resources
- script-src: 'self' — no inline scripts
- style-src: 'self' 'unsafe-inline' — allows inline styles for component libraries
- img-src: 'self' data: — allows data URIs for icons
- frame-ancestors: 'none' — prevents clickjacking

## Rate Limiting

ThrottlerModule registered with two named configurations:
- default: 100 requests per 60 seconds (general endpoints)
- auth: 5 requests per 60 seconds (login/register endpoints)
ThrottlerGuard registered as APP_GUARD applies rate limiting globally.
Health endpoints use @SkipThrottle() to bypass rate limiting.

## CORS Configuration

- Origin from CORS_ORIGIN environment variable (no fallback)
- Credentials: true
- Methods: GET, POST, PATCH, DELETE, OPTIONS
- Allowed Headers: Content-Type, Authorization, X-Correlation-ID

## Input Validation

- ValidationPipe with whitelist: strips unknown properties
- forbidNonWhitelisted: rejects requests with unknown properties (400)
- transform: auto-transforms payloads to DTO class instances
- All DTOs use class-validator decorators

## Row Level Security

- All tables have ENABLE ROW LEVEL SECURITY
- All tables have FORCE ROW LEVEL SECURITY
- RLS policies isolate tenant data at the database level

## Convention Gates

- Zero `as any` type assertions
- Zero `console.log` in production API code
- Zero `|| 'value'` env var fallback patterns
- Zero `$executeRawUnsafe` calls
- Zero `dangerouslySetInnerHTML` usage

## Secrets Management

- JWT_SECRET from environment variable, no fallback
- DATABASE_URL from environment variable
- CORS_ORIGIN from environment variable
- All secrets validated at startup via validateEnvVars()
