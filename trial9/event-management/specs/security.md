# Security Specification

## Overview

The Event Management platform implements defense-in-depth security with multiple
layers of protection: authentication, authorization, input validation, rate limiting,
security headers, and tenant isolation via RLS.

## Authentication

VERIFY: EM-SEC-001 — TenantId parameter decorator extracts tenantId from JWT payload for controller use

VERIFY: EM-SEC-002 — RolesGuard checks @Roles() metadata against JWT payload role claim

### JWT Auth Guard
Global JwtAuthGuard registered as APP_GUARD in AppModule. All routes require
authentication by default. The @Public() decorator exempts specific routes.

### Roles-Based Access Control (RBAC)
RolesGuard registered as APP_GUARD evaluates @Roles() decorator metadata.
At least 2 endpoints use @Roles('ADMIN') for admin-only operations:
- DELETE /tickets/:id — only admins can delete tickets

## Input Validation

ValidationPipe with whitelist, forbidNonWhitelisted, and transform options.
All DTOs use class-validator decorators:
- @IsString(), @IsEmail(), @MaxLength() on all string fields
- @IsIn() for enum values
- @MaxLength(36) on UUID fields
- @IsNumber(), @Min() for numeric fields
- @IsDateString() for date fields
- @IsOptional() for optional fields

Minimum 10 class-validator decorator instances across all DTOs.

## Rate Limiting

ThrottlerModule with named configurations:
- default: 100 requests per 60 seconds
- auth: 5 requests per 60 seconds (brute force protection)
ThrottlerGuard registered as APP_GUARD.

## Security Headers

Helmet.js with Content Security Policy:
- default-src: 'self'
- script-src: 'self'
- style-src: 'self' 'unsafe-inline'
- img-src: 'self' data:
- frame-ancestors: 'none'

## CORS

Configured via app.enableCors() with:
- origin from CORS_ORIGIN env variable
- credentials: true
- explicit methods and headers

## Row Level Security

All tables have RLS enabled with tenant isolation policies.
Policy syntax uses direct TEXT comparison (no ::uuid cast on TEXT columns).
Each table with ENABLE ROW LEVEL SECURITY also has a CREATE POLICY statement.

## Global Exception Filter

GlobalExceptionFilter registered as APP_FILTER:
- Sanitizes error responses (no stack traces in production)
- Includes correlationId in response body
- Uses sanitizeLogContext for request body logging

## Dependency Audit

Uses bcryptjs (pure JS) instead of bcrypt (native) to eliminate tar vulnerability chain.
pnpm audit --audit-level=high runs in CI with zero high/critical tolerance.

## Cross-References

- See [authentication.md](authentication.md) for JWT configuration
- See [monitoring.md](monitoring.md) for error handling and logging
