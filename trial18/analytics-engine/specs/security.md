# Security Specification

## Overview

The Analytics Engine implements defense-in-depth security with JWT authentication, RBAC, rate limiting, CORS, CSP headers, input validation, and row-level security. All security patterns are applied as architectural boilerplate during initial setup.

See also: [authentication.md](authentication.md) for JWT details, [data-model.md](data-model.md) for RLS policies.

## Authentication Guards

VERIFY: AE-SEC-001 — AppModule registers JwtAuthGuard, RolesGuard, and ThrottlerGuard as APP_GUARD providers

### Global JWT Auth Guard
- Registered via APP_GUARD in AppModule providers
- Checks IS_PUBLIC_KEY metadata to skip auth for public routes
- All non-@Public endpoints require valid JWT

### Roles Guard
- Registered via APP_GUARD after JwtAuthGuard
- Checks ROLES_KEY metadata against user.role from JWT
- Returns 403 Forbidden for insufficient roles

## Rate Limiting

VERIFY: AE-SEC-002 — AuthService uses bcryptjs with BCRYPT_SALT_ROUNDS from shared for password hashing

### ThrottlerModule Configuration
- default: 100 requests per 60 seconds
- auth: 5 requests per 60 seconds (login/register protection)
- ThrottlerGuard as APP_GUARD

## Input Validation

VERIFY: AE-SEC-003 — DashboardController extracts tenant context from req.user.tenantId for all operations

### ValidationPipe
- whitelist: true (strip unknown properties)
- forbidNonWhitelisted: true (reject unknown properties)
- transform: true (auto-transform payloads)

### DTO Validation
- All string fields: @IsString() + @MaxLength()
- UUID fields: @MaxLength(36)
- Email fields: @IsEmail() + @IsString() + @MaxLength()
- Enum fields: @IsIn() with valid values

## HTTP Security Headers

VERIFY: AE-SEC-004 — main.ts registers Helmet with CSP directives (default-src, script-src, style-src, img-src, frame-ancestors)

### Helmet CSP Configuration
- default-src: 'self'
- script-src: 'self'
- style-src: 'self' 'unsafe-inline'
- img-src: 'self' data:
- frame-ancestors: 'none'

## CORS

VERIFY: AE-SEC-005 — main.ts configures CORS with CORS_ORIGIN env, credentials true, explicit methods and headers

### CORS Configuration
- Origin from CORS_ORIGIN environment variable (no fallback)
- credentials: true
- Explicit methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
- Explicit headers: Content-Type, Authorization, X-Correlation-ID

## Row Level Security

VERIFY: AE-SEC-006 — AuthService implements setTenantContext using $executeRaw with Prisma.sql template

### RLS Implementation
- All tables with tenant_id have ENABLE + FORCE ROW LEVEL SECURITY
- CREATE POLICY for each table using TEXT comparison (no ::uuid cast)
- setTenantContext service method uses $executeRaw for tenant context

## Error Handling
- GlobalExceptionFilter sanitizes error responses
- No stack traces in production responses
- CorrelationId included in all error response bodies
- Request body sanitized via sanitizeLogContext before logging
