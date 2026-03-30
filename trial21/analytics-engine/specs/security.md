# Security Specification

## Overview

The analytics engine implements defense-in-depth security with JWT authentication,
role-based access control, rate limiting, and Row Level Security for multi-tenancy.

Cross-reference: See [authentication.md](authentication.md) for JWT token details.
Cross-reference: See [data-model.md](data-model.md) for RLS policy definitions.

## Authentication & Authorization

### Global Guards
- JwtAuthGuard: Applied globally via APP_GUARD, skips @Public() routes
- ThrottlerGuard: Applied globally via APP_GUARD for rate limiting
- RolesGuard: Applied globally via APP_GUARD, checks @Roles() metadata

### Role-Based Access Control
- Dashboard deletion: requires ADMIN or USER role
- Data source deletion: requires ADMIN role
- Metrics endpoint: requires ADMIN role

## VERIFY Tags

VERIFY: AE-SEC-001 — bcrypt salt rounds configuration
VERIFY: AE-SEC-002 — log sanitization removes sensitive fields
VERIFY: AE-SEC-003 — role-based access control guard
VERIFY: AE-SEC-004 — global JWT auth guard with public route bypass
VERIFY: AE-SEC-005 — global guards: JwtAuthGuard and ThrottlerGuard
VERIFY: AE-SEC-006 — throttler configuration with short/medium/long windows
VERIFY: AE-SEC-007 — helmet with CSP frame-ancestors:none
VERIFY: AE-SEC-008 — ValidationPipe with whitelist and forbidNonWhitelisted
VERIFY: AE-SEC-010 — RLS policies enforce tenant isolation
VERIFY: AE-SEC-011 — RLS tenant context setting uses parameterized query

## HTTP Security Headers

- Helmet middleware with CSP frame-ancestors:'none'
- x-powered-by header disabled
- CORS configured with explicit origins
- X-Response-Time header added by interceptor
- X-Correlation-ID for request tracing

## Input Validation

- Global ValidationPipe with whitelist: true, forbidNonWhitelisted: true
- All DTO strings: @IsString() + @MaxLength()
- All DTO UUIDs: @MaxLength(36)
- Emails: @IsEmail() + @IsString() + @MaxLength()
- No raw SQL execution except parameterized Prisma.sql templates

## Row Level Security

- All tenant-scoped tables have ENABLE + FORCE ROW LEVEL SECURITY
- Policies use current_setting('app.tenant_id', true)
- Tenant ID stored as TEXT (no ::uuid cast)
- PrismaService.setTenantContext() uses $executeRaw(Prisma.sql`...`)

## Edge Cases

VERIFY: AE-SEC-009 — forbidden non-whitelisted properties rejected by ValidationPipe
VERIFY: AE-SEC-012 — unauthenticated request to protected endpoint returns 401
