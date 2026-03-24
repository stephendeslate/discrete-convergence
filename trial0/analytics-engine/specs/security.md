# Security Specification

## Overview

Defense-in-depth security with Helmet CSP, CORS restrictions, input validation,
rate limiting, Row Level Security, and sanitized error responses.

## Content Security Policy

- VERIFY:AE-SEC-001 — Helmet CSP configuration in main.ts
- default-src: 'self'
- script-src: 'self'
- style-src: 'self' 'unsafe-inline' (required for Tailwind)
- img-src: 'self' data: (for inline images)
- frame-ancestors: 'none' (prevents clickjacking)

## CORS

- VERIFY:AE-SEC-002 — CORS origin from CORS_ORIGIN environment variable
- No fallback value — missing CORS_ORIGIN causes startup failure via validateEnvVars
- Single origin string, not wildcard
- Credentials enabled for cookie/auth header support

## Input Validation

- VERIFY:AE-SEC-003 — Global ValidationPipe configuration
- whitelist: true — strips properties not in DTO
- forbidNonWhitelisted: true — rejects requests with unknown properties
- transform: true — auto-transforms query params to correct types
- All DTOs use class-validator decorators (@IsEmail, @IsString, @MaxLength, @IsIn)

## Rate Limiting

- VERIFY:AE-SEC-004 — ThrottlerModule with two named configurations
- Default: 100 requests per 60 seconds (general API usage)
- Auth: 5 requests per 60 seconds (login/register brute force protection)
- @SkipThrottle() on monitoring endpoints (health, ready, metrics)

## Row Level Security

- PostgreSQL RLS enabled and forced on all tenant-scoped tables
- Policies use current_setting('app.tenant_id') for row filtering
- Prisma sets tenant context via $executeRaw before tenant-scoped queries
- No $executeRawUnsafe anywhere in codebase (convention gate)

## Error Sanitization

- VERIFY:AE-MON-001 — GlobalExceptionFilter catches all exceptions
- VERIFY:AE-MON-002 — No stack traces in HTTP responses
- Error responses include correlationId for log correlation
- Internal errors return generic 500 message, not raw exception details
- VERIFY:AE-SAN-001 — sanitizeLogContext redacts password, token, secret, authorization fields
- VERIFY:AE-SAN-002 — Deep nested sanitization handles objects and arrays recursively

## Convention Gates

Zero tolerance enforced across codebase:
- No `as any` type assertions
- No `console.log` in api/src (use structured logger)
- No `|| 'value'` fallback patterns (use env validation)
- No `$executeRawUnsafe` (use $executeRaw with Prisma.sql)
- No `dangerouslySetInnerHTML` in frontend

## Authentication Security

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens signed with HMAC (HS256)
- No password in JWT payload or API responses
- Generic error messages on auth failure (no user enumeration)
- findFirst calls justified with comments per methodology

## Test Coverage

- VERIFY:AE-TEST-005 — Security integration tests: auth rejection, input validation,
  error sanitization, rate limiting
- VERIFY:AE-TEST-006 — Performance tests verify pagination clamping prevents abuse

## Cross-References

- See [authentication.md](authentication.md) for JWT guard chain details
- See [monitoring.md](monitoring.md) for error logging and correlation
- See [data-model.md](data-model.md) for RLS policy definitions
- See [api-endpoints.md](api-endpoints.md) for validation on each route
