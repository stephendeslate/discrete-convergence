# Security Specification

## Overview

The Analytics Engine implements defense-in-depth security with JWT
authentication, role-based access control, tenant isolation via
row-level security, rate limiting, and content security policy headers.

## Authentication Guards

### JwtAuthGuard (APP_GUARD)

Applied globally via APP_GUARD. Checks IS_PUBLIC_KEY metadata to
allow unauthenticated access to specific endpoints.

VERIFY: AE-SEC-001 — JwtAuthGuard checks IS_PUBLIC_KEY for public endpoints

### @Public() Decorator

Sets IS_PUBLIC_KEY metadata. Applied to:
- Health endpoints (GET /health, GET /health/ready)
- Metrics endpoint (GET /metrics)
- Auth endpoints (POST /auth/register, /auth/login, /auth/refresh)

VERIFY: AE-SEC-002 — @Public decorator exempts endpoints from JWT validation

## Role-Based Access Control

### RolesGuard (APP_GUARD)

Checks ROLES_KEY metadata for required roles. If no roles specified,
allows access. Otherwise, verifies user role matches required roles.

VERIFY: AE-SEC-003 — RolesGuard validates user role against ROLES_KEY metadata

### Protected Endpoints

- DELETE /dashboards/:id — @Roles('ADMIN')
- DELETE /data-sources/:id — @Roles('ADMIN')

VERIFY: AE-SEC-009 — At least two endpoints require ADMIN role

## Tenant Isolation

### Row-Level Security (RLS)

All 15 database tables have RLS policies:
- ENABLE ROW LEVEL SECURITY on each table
- FORCE ROW LEVEL SECURITY to apply to table owner
- CREATE POLICY using current_setting('app.current_tenant_id')

### setTenantContext

PrismaService.setTenantContext() uses parameterized SQL:
```
Prisma.sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`
```

VERIFY: AE-SEC-004 — RLS policies on all 15 tables
VERIFY: AE-SEC-010 — setTenantContext uses Prisma.sql template (not string interpolation)

## HTTP Security Headers

### Helmet Configuration

- Content-Security-Policy with frameAncestors: 'none'
- X-Powered-By header disabled

VERIFY: AE-SEC-005 — CSP frameAncestors set to 'none'
VERIFY: AE-SEC-008 — x-powered-by header disabled

### CORS

Configured with specific origin (CORS_ORIGIN env var), allowed methods,
allowed headers, and credentials support.

VERIFY: AE-SEC-006 — CORS restricts origin to configured value

## Input Validation

ValidationPipe applied globally with:
- whitelist: true — strips unknown properties
- forbidNonWhitelisted: true — rejects unknown properties
- transform: true — auto-transforms types

VERIFY: AE-SEC-007 — ValidationPipe rejects requests with unknown fields

## Rate Limiting

ThrottlerModule configured with three tiers:
- short: 100 requests per 1 second
- medium: 500 requests per 10 seconds
- long: 2000 requests per 60 seconds

Auth endpoints have stricter limits: 10 per second.

VERIFY: AE-PERF-003 — ThrottlerModule with three rate limit tiers

## Log Sanitization

GlobalExceptionFilter sanitizes error context using sanitizeLogContext
from @repo/shared before logging. This strips sensitive keys like
password, token, authorization, cookie.

VERIFY: AE-MON-005 — Exception filter sanitizes sensitive data before logging
