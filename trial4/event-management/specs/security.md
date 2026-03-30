# Security Specification

## Overview

The Event Management platform implements defense-in-depth security: Helmet CSP
headers, CORS with explicit configuration, rate limiting via ThrottlerModule,
input validation with class-validator, and Row Level Security at the database layer.

See [authentication.md](authentication.md) for JWT and password security.
See [data-model.md](data-model.md) for RLS configuration.

## Requirements

### VERIFY:EM-SEC-001 — RLS via $executeRaw with Prisma.sql
Row Level Security context is set using `$executeRaw(Prisma.sql\`...\`)` template
literals. The application NEVER uses `$executeRawUnsafe`. The PrismaService
provides a `setRlsContext(organizationId)` method for tenant isolation.

### VERIFY:EM-SEC-002 — JWT Strategy without Hardcoded Fallback
The JwtStrategy reads `JWT_SECRET` from `process.env` and throws an Error if
the variable is not set. There is no hardcoded fallback secret. The strategy
uses `ExtractJwt.fromAuthHeaderAsBearerToken()` for token extraction.

### VERIFY:EM-SEC-003 — DTO Validation Decorators
All DTOs enforce validation:
- String fields: `@IsString()` + `@MaxLength()`
- UUID fields: `@MaxLength(36)`
- Email fields: `@IsEmail()` + `@IsString()` + `@MaxLength()`
- The ValidationPipe is configured with `forbidNonWhitelisted: true`

### VERIFY:EM-SEC-004 — Event DTO Validation
The CreateEventDto validates:
- title: `@IsString()` + `@MaxLength(255)`
- slug: `@IsString()` + `@MaxLength(255)`
- description: `@IsOptional()` + `@IsString()` + `@MaxLength(5000)`
- timezone: `@IsOptional()` + `@IsString()` + `@MaxLength(50)`
- startDate/endDate: `@IsDateString()` + `@MaxLength(30)`
- venueId: `@IsOptional()` + `@IsString()` + `@MaxLength(36)`

## Helmet CSP

Content Security Policy directives:
- `default-src: 'self'`
- `script-src: 'self'`
- `style-src: 'self' 'unsafe-inline'`
- `img-src: 'self' data:`
- `frame-ancestors: 'none'`

## Rate Limiting

ThrottlerModule configured with two named configs:
- `default`: 100 requests per 60 seconds
- `auth`: 5 requests per 60 seconds (login/register)

ThrottlerGuard registered as APP_GUARD for global enforcement.

## CORS

CORS configured from `CORS_ORIGIN` environment variable:
- No hardcoded fallback origin
- `credentials: true`
- Explicit methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
- Explicit headers: Content-Type, Authorization, X-Correlation-ID

## Input Validation

Global ValidationPipe with:
- `whitelist: true` — strips unrecognized properties
- `forbidNonWhitelisted: true` — rejects requests with extra properties
- `transform: true` — auto-transforms payloads to DTO instances

## Convention Gates

- Zero `as any` type assertions
- Zero `$executeRawUnsafe` calls
- Zero `dangerouslySetInnerHTML` usage
- Zero hardcoded secret fallbacks
