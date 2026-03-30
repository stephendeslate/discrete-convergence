# Security Specification

## Overview

The Analytics Engine implements defense-in-depth security with multiple layers:
authentication, authorization, input validation, rate limiting, and HTTP hardening.

## Authentication

- JWT-based authentication via passport-jwt
- bcryptjs with 12 salt rounds for password hashing
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Tokens contain userId, email, tenantId, role

<!-- VERIFY:SEC-BCRYPT — bcryptjs with salt rounds >= 12 -->

## Authorization

### Tenant Isolation
- TenantGuard validates user.tenantId on every protected request
- PrismaService.setTenantContext sets app.current_tenant_id via $executeRaw
- Row Level Security (RLS) at database level as defense-in-depth
- ENABLE + FORCE + CREATE POLICY on all tenanted tables

<!-- VERIFY:SEC-TENANT-GUARD — TenantGuard checks user.tenantId -->
<!-- VERIFY:SEC-RLS — Database-level row level security -->

### Role-Based Access
- UserRole enum: ADMIN, EDITOR, VIEWER
- canEdit() utility checks role against ADMIN or EDITOR
- isAdmin() utility checks for ADMIN role

## Input Validation

- Global ValidationPipe with:
  - whitelist: true (strips unknown properties)
  - forbidNonWhitelisted: true (rejects unknown properties with 400)
  - transform: true (auto-transform payloads to DTO instances)
- All string DTO fields have @MaxLength() decorator
- UUID fields use @MaxLength(36)
- Email fields use @IsEmail() + @MaxLength(255)
- Password fields use @MinLength(8) + @MaxLength(128)

<!-- VERIFY:SEC-VALIDATION — forbidNonWhitelisted rejects unknown fields -->
<!-- VERIFY:SEC-MAXLENGTH — All string DTOs have @MaxLength -->

## Rate Limiting

- ThrottlerModule.forRoot with limit >= 20000 (global)
- Login endpoint has additional @Throttle({ default: { ttl: 60000, limit: 10 } })
- ThrottlerGuard registered as APP_GUARD

<!-- VERIFY:SEC-THROTTLE — ThrottlerModule limit >= 20000 -->

## HTTP Security Headers

Helmet middleware configured with:
- Content-Security-Policy (CSP) directives
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Strict-Transport-Security
- X-XSS-Protection

<!-- VERIFY:SEC-HELMET — Helmet with CSP directives in main.ts -->

## CORS

- Enabled via app.enableCors()
- Origin configurable via CORS_ORIGIN environment variable

## Error Handling

- GlobalExceptionFilter catches all exceptions
- Correlation ID included in error responses
- Stack traces only shown in development
- No sensitive data leaked in error messages

## Code Quality Rules

- No `as any` type casts in API source code
- No console.log in API source code (use Logger)
- No `|| 'fallback'` patterns for environment variables
- Use process.env['KEY'] ?? 'default' pattern instead

<!-- VERIFY:SEC-NO-AS-ANY — No as any casts in API src -->

## Sensitive Data Protection

- Passwords never returned in API responses
- JWT secret loaded from environment variable
- Connection configs stored as encrypted JSON
- Log sanitizer strips sensitive fields (password, token, secret, authorization, cookie)

## Implementation Traceability

<!-- VERIFY:SEC-EXTRA-FIELDS — Extra fields rejected by forbidNonWhitelisted -->
<!-- VERIFY:SEC-HEALTH-PUBLIC — Health endpoints are public -->
<!-- VERIFY:SEC-INVALID-JWT — Invalid JWT returns 401 -->
<!-- VERIFY:SEC-MALFORMED-AUTH — Malformed Authorization header handled -->
<!-- VERIFY:SEC-SHORT-PASSWORD — Short password rejected by @MinLength -->
<!-- VERIFY:SEC-SQL-INJECTION — SQL injection prevented by parameterized queries -->
<!-- VERIFY:SEC-SUITE — Security test suite -->
<!-- VERIFY:SEC-UNAUTH — Unauthenticated requests return 401 -->
<!-- VERIFY:SEC-XSS — XSS prevented by Helmet CSP -->
<!-- VERIFY:AE-PUB-001 — Public decorator bypasses auth guards for public routes -->
<!-- VERIFY:AUTH-PUBLIC-DECORATOR — Public route decorator for unauthenticated endpoints -->
