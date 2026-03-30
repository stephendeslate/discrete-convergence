# Security Specification

## Overview

Fleet Dispatch implements defense-in-depth security with Helmet CSP,
rate limiting, CORS, input validation, and JWT authentication.
All security mechanisms are configured in main.ts and AppModule.
See [authentication.md](authentication.md) for auth details.

## Content Security Policy

Helmet.js is configured with the following CSP directives:
- default-src: 'self'
- script-src: 'self'
- style-src: 'self' 'unsafe-inline'
- img-src: 'self' data:
- frame-ancestors: 'none'

## Rate Limiting

### VERIFY:FD-SEC-001 — Public Decorator
The @Public() decorator must set IS_PUBLIC_KEY metadata.
Routes decorated with @Public() bypass JwtAuthGuard.
Used for auth routes and health endpoints.

### VERIFY:FD-SEC-002 — JWT Auth Guard as APP_GUARD
JwtAuthGuard must be registered as APP_GUARD in AppModule.
Domain controllers must NOT use @UseGuards(JwtAuthGuard).
The guard checks IS_PUBLIC_KEY metadata to skip public routes.

### VERIFY:FD-SEC-003 — Bootstrap Security Configuration
main.ts must:
1. Call validateEnvVars() for DATABASE_URL, JWT_SECRET, CORS_ORIGIN
2. Configure Helmet with CSP directives
3. Enable CORS with origin from CORS_ORIGIN env (no fallback), credentials true,
   explicit methods and headers
4. Configure ValidationPipe with whitelist, forbidNonWhitelisted, transform

### VERIFY:FD-SEC-004 — Security Integration Tests
Security tests must verify:
- Protected routes return 401 without auth
- Invalid JWT tokens are rejected
- Public routes are accessible without auth
- Non-whitelisted fields are rejected (forbidNonWhitelisted)
- Email format is validated
- Empty bodies are rejected
- Stack traces are not exposed in error responses
- Correlation IDs are present in error responses

## ThrottlerModule Configuration

ThrottlerModule configured with two named rate limits:
- default: ttl=60000, limit=100 (general API requests)
- auth: ttl=60000, limit=5 (authentication endpoints)

ThrottlerGuard registered as APP_GUARD in AppModule.
Health and metrics endpoints use @SkipThrottle().

## CORS Configuration

- Origin: from CORS_ORIGIN environment variable (no fallback)
- Credentials: true
- Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
- Allowed Headers: Content-Type, Authorization, X-Correlation-ID

## Input Validation

ValidationPipe configuration:
- whitelist: true — strip unknown properties
- forbidNonWhitelisted: true — reject requests with unknown properties
- transform: true — auto-transform payloads to DTO instances

All DTO string fields require @IsString() + @MaxLength().
UUID fields require @MaxLength(36).
Email fields require @IsEmail() + @IsString() + @MaxLength().

## Convention Gates

Binary security gates (zero tolerance):
- Zero `as any` type assertions
- Zero `console.log` in apps/api/src/
- Zero `|| 'value'` env var fallback patterns
- Zero `$executeRawUnsafe` calls
- Zero `dangerouslySetInnerHTML` usage
