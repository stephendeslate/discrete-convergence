# Security Specification

## Overview

The Analytics Engine implements defense-in-depth security with multiple layers:
authentication, authorization, input validation, rate limiting, security headers,
and database-level row isolation. All security measures are configured globally
via NestJS APP_GUARD and APP_FILTER providers.

See also: authentication.md for JWT and auth flow details.
See also: infrastructure.md for environment variable validation.

## Authentication Security

- JWT tokens with 1-hour expiry for access tokens
- Separate JWT_REFRESH_SECRET for refresh tokens
- Token extraction via Authorization Bearer header only
- No token storage in localStorage (httpOnly cookies in frontend)

VERIFY: AE-SEC-001 — Helmet middleware sets Content-Security-Policy headers
VERIFY: AE-SEC-002 — X-Powered-By header is disabled
VERIFY: AE-SEC-003 — CORS configured with explicit origin from environment variable

## Rate Limiting

- Global ThrottlerGuard applied via APP_GUARD
- Default: 100 requests per second (short window) for general endpoints
- Auth endpoints: 10 requests per second via @Throttle decorator
- Rate limiting applies before authentication check in guard chain

VERIFY: AE-SEC-004 — Rate limiting enforced globally with stricter limits on auth endpoints

## Input Validation

- ValidationPipe with whitelist: true strips unknown properties
- forbidNonWhitelisted: true rejects unknown properties with 400
- transform: true enables automatic type conversion
- DTOs use class-validator decorators (@IsEmail, @IsString, @MaxLength, etc.)
- No raw SQL queries use $executeRawUnsafe (parameterized only)

VERIFY: AE-SEC-006 — ValidationPipe configured with whitelist and forbidNonWhitelisted
VERIFY: AE-SEC-007 — No use of $executeRawUnsafe anywhere in codebase

## Security Headers

Applied via helmet middleware in main.ts:
- Content-Security-Policy: default-src 'self', frame-ancestors 'none'
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY (via frame-ancestors)
- X-XSS-Protection: 0 (deprecated, CSP preferred)
- Strict-Transport-Security: included by default

## Multi-Tenant Isolation

- Every database query includes tenantId from JWT payload
- Row-Level Security policies on all four tables
- RLS uses ENABLE + FORCE to prevent bypass
- Application-level filtering as first defense layer
- Database-level RLS as second defense layer

VERIFY: AE-SEC-008 — All service methods scope queries by tenantId from authenticated user

## Error Handling

- GlobalExceptionFilter catches all unhandled errors
- Error responses never leak stack traces in production
- Sensitive data sanitized from log output via sanitizeLogContext
- Correlation IDs included in all error responses for debugging
- Pino structured logging for all error events

## Environment Security

VERIFY: AE-SEC-005 — Environment variables validated at startup

- validateEnvVars checks DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET
- Server refuses to start if required variables are missing or empty
- .env.example documents all required variables without real values
- Docker Compose uses environment block (no env_file for secrets)

## Password Security

- bcryptjs with 12 salt rounds (from BCRYPT_SALT_ROUNDS constant)
- No password returned in any API response
- Login response only indicates success/failure, not user existence
