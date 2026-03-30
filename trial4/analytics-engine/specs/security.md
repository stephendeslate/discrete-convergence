# Security Specification

## Overview

The Analytics Engine implements defense-in-depth security with Helmet CSP,
rate limiting, CORS restrictions, input validation, and Row Level Security.
All security measures are enforced globally via NestJS providers.

See [authentication.md](authentication.md) for JWT and auth details.
See [monitoring.md](monitoring.md) for exception filtering and log sanitization.

## Requirements

### VERIFY:AE-SEC-005
ThrottlerModule MUST be configured with TWO named configs:
- { name: 'default', ttl: 60000, limit: 100 }
- { name: 'auth', ttl: 60000, limit: 5 }
ThrottlerGuard MUST be registered as APP_GUARD.

### VERIFY:AE-SEC-006
validateEnvVars() from shared MUST be called at startup to validate
DATABASE_URL, JWT_SECRET, and CORS_ORIGIN.

### VERIFY:AE-SEC-007
Helmet MUST be configured with CSP directives:
- default-src: 'self'
- script-src: 'self'
- style-src: 'self' 'unsafe-inline'
- img-src: 'self' data:
- frame-ancestors: 'none'

### VERIFY:AE-SEC-008
CORS MUST use CORS_ORIGIN from environment variable with NO fallback.
credentials: true, explicit methods and allowed headers.

### VERIFY:AE-SEC-009
ValidationPipe MUST be configured with:
- whitelist: true
- forbidNonWhitelisted: true
- transform: true
This strips unknown properties and rejects non-whitelisted fields.

## Rate Limiting

Two tiers of rate limiting protect against abuse:
- Default: 100 requests per 60 seconds per IP
- Auth: 5 login/register attempts per 60 seconds per IP
- Health endpoints exempt via @SkipThrottle()

## Input Validation

All DTOs enforce:
- @IsString() + @MaxLength() on all string fields
- @IsEmail() + @IsString() + @MaxLength() on email fields
- @MaxLength(36) on UUID fields
- @IsIn(ALLOWED_VALUES) on enum fields
- forbidNonWhitelisted rejects unknown properties (400 Bad Request)

## Row Level Security

All tables with tenant data have:
- ENABLE ROW LEVEL SECURITY
- FORCE ROW LEVEL SECURITY
Applied in the initial migration for all tenant-scoped tables.

## Environment Variable Security

- JWT_SECRET: required, no fallback value
- CORS_ORIGIN: required, no fallback value
- DATABASE_URL: required, validated at startup
- ENCRYPTION_KEY: for DataSource config encryption (not logged)

## Convention Gates

Binary security gates (zero tolerance):
- Zero `as any` type assertions
- Zero `console.log` in api/src/
- Zero `|| 'value'` env var fallback patterns
- Zero `$executeRawUnsafe` calls
- Zero `dangerouslySetInnerHTML` usage
