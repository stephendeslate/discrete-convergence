# Security Specification

## Overview
Comprehensive security with defense-in-depth: Helmet CSP, CORS, rate limiting,
JWT authentication, RBAC, input validation, and Row Level Security.

## Helmet CSP
- default-src: 'self'
- script-src: 'self'
- style-src: 'self' 'unsafe-inline'
- img-src: 'self' data:
- frame-ancestors: 'none'

## Rate Limiting (ThrottlerModule)
- Default: 100 requests per 60 seconds
- Auth endpoints: 5 requests per 60 seconds
- ThrottlerGuard registered as APP_GUARD

## CORS
- Origin from CORS_ORIGIN environment variable (no fallback)
- credentials: true

## Guards (APP_GUARD order)
1. ThrottlerGuard - rate limiting
2. JwtAuthGuard - authentication
3. RolesGuard - authorization
- VERIFY: FD-SEC-001 - Requests without auth rejected
- VERIFY: FD-SEC-002 - USER cannot delete vehicles
- VERIFY: FD-SEC-003 - USER cannot delete drivers
- VERIFY: FD-SEC-004 - USER cannot delete routes
- VERIFY: FD-SEC-005 - USER cannot create vehicles

## Input Validation
- ValidationPipe: whitelist + forbidNonWhitelisted + transform
- All DTO string fields: @IsString() + @MaxLength()
- UUID fields: @MaxLength(36)
- Email: @IsEmail() + @IsString() + @MaxLength()
- VERIFY: FD-SEC-006 - Unknown properties rejected

## Tenant Isolation
- Every controller extracts req.user.tenantId
- Every service method receives tenantId parameter
- findFirst calls scoped by tenantId (with justification comment)
- VERIFY: FD-VEH-009 - Not found when accessing other tenant's vehicle
- VERIFY: FD-VEH-011 - Not found when updating other tenant's vehicle
- VERIFY: FD-VEH-013 - Not found when deleting other tenant's vehicle

## Row Level Security
- All tables: ENABLE + FORCE + CREATE POLICY
- Policy: tenant_id = current_setting('app.current_tenant_id')::uuid

## Sensitive Data
- sanitizeLogContext redacts: password, passwordHash, token, accessToken, secret, authorization
- Deep nested and array support
- VERIFY: FD-SEC-007 - Correlation ID in response headers

## Cross-References
- See [authentication.md](authentication.md) for auth endpoints
- See [monitoring.md](monitoring.md) for exception filter
