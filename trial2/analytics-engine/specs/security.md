# Security Specification

## Overview

The Analytics Engine implements defense-in-depth security with JWT authentication,
rate limiting, input validation, CSP headers, CORS configuration, and row-level
security at the database level. All security measures are enforced via NestJS
dependency injection.

## Authentication Architecture

### JWT Authentication

- JwtAuthGuard is registered as APP_GUARD in AppModule
- Domain controllers do NOT use @UseGuards(JwtAuthGuard) — the global guard handles it
- Routes marked with @Public() decorator are exempt from authentication
- JWT secret is loaded from JWT_SECRET environment variable with no fallback

### Rate Limiting

- ThrottlerModule is configured with two named configs:
  - `default`: 100 requests per 60 seconds
  - `auth`: 5 requests per 60 seconds
- ThrottlerGuard is registered as APP_GUARD in AppModule

## Requirements

<!-- VERIFY:AE-SEC-001 — JWT strategy uses env JWT_SECRET with no fallback -->
- REQ-SEC-001: JWT strategy must load secret from process.env['JWT_SECRET']
- No default or fallback secret is permitted

<!-- VERIFY:AE-SEC-002 — JwtAuthGuard registered as APP_GUARD, respects @Public() -->
- REQ-SEC-002: JwtAuthGuard must be a global APP_GUARD
- Must respect @Public() decorator via Reflector

<!-- VERIFY:AE-SEC-003 — ThrottlerModule with 'default' and 'auth' named configs -->
- REQ-SEC-003: ThrottlerModule must have both named configurations
- default: ttl 60000, limit 100
- auth: ttl 60000, limit 5

<!-- VERIFY:AE-SEC-004 — main.ts calls validateEnvVars, configures Helmet CSP and CORS -->
- REQ-SEC-004: Application bootstrap must validate required env vars
- DATABASE_URL, JWT_SECRET, and CORS_ORIGIN must be validated at startup

<!-- VERIFY:AE-SEC-005 — Helmet CSP with required directives -->
- REQ-SEC-005: Helmet CSP must include:
  - defaultSrc: 'self'
  - scriptSrc: 'self'
  - styleSrc: 'self' 'unsafe-inline'
  - imgSrc: 'self' data:
  - frameAncestors: 'none'

<!-- VERIFY:AE-SEC-006 — CORS from CORS_ORIGIN env with credentials and explicit headers -->
- REQ-SEC-006: CORS must use CORS_ORIGIN env var (no fallback)
- credentials: true
- Explicit methods and allowed headers

<!-- VERIFY:AE-SEC-007 — ValidationPipe with whitelist + forbidNonWhitelisted + transform -->
- REQ-SEC-007: Global ValidationPipe must have all three options enabled

## Row Level Security

- All tables have `ENABLE ROW LEVEL SECURITY` in migration
- All tables have `FORCE ROW LEVEL SECURITY` in migration
- RLS policies are defined at the database level
- Application-level tenant scoping uses findFirst with tenantId filter

## Input Validation

- All DTO string fields: @IsString() + @MaxLength()
- All DTO UUID fields: @MaxLength(36)
- Email fields: @IsEmail() + @IsString() + @MaxLength()
- ValidationPipe rejects unknown properties (forbidNonWhitelisted)
- ValidationPipe strips unknown properties (whitelist)

## Error Handling

- GlobalExceptionFilter as APP_FILTER sanitizes error responses
- No stack traces are exposed to clients
- Request bodies are sanitized via sanitizeLogContext before logging
- CorrelationId is included in all error responses

## Convention Gates

- Zero `as any` type assertions
- Zero `console.log` in apps/api/src/
- Zero `|| 'value'` fallback patterns for env vars
- Zero `$executeRawUnsafe`
- Zero `dangerouslySetInnerHTML`

## Testing

Security integration tests (security.spec.ts) verify:
- Unauthenticated requests are rejected
- Invalid JWT tokens are rejected
- Extra fields are rejected
- Overlong strings are rejected
- Security headers are present
- Stack traces are not exposed
- CorrelationId is in error responses
