# Security Specification

## Overview

Fleet Dispatch implements defense-in-depth security with multiple layers:
JWT authentication, RBAC authorization, input validation, rate limiting,
CORS, CSP headers, and database-level row security policies.

## Authentication Guard

- VERIFY: FD-SEC-004 — Global JwtAuthGuard registered as APP_GUARD
- VERIFY: FD-SEC-005 — @Public() decorator exempts auth and health endpoints
- VERIFY: FD-SEC-006 — RolesGuard registered as APP_GUARD for RBAC enforcement

## Input Validation

- VERIFY: FD-SEC-007 — ValidationPipe with whitelist, forbidNonWhitelisted, transform
- VERIFY: FD-SEC-008 — All DTO string fields have @MaxLength() decorators
- VERIFY: FD-SEC-009 — All DTO UUID fields have @MaxLength(36) decorators

## Rate Limiting

- VERIFY: FD-SEC-010 — ThrottlerModule with default config (ttl: 60000, limit: 100)
- VERIFY: FD-SEC-011 — ThrottlerModule with auth config (ttl: 60000, limit: 5)
- VERIFY: FD-SEC-012 — ThrottlerGuard registered as APP_GUARD

## CORS

- VERIFY: FD-SEC-013 — CORS configured with CORS_ORIGIN from environment (no fallback)

CORS settings:
- origin: from CORS_ORIGIN env var
- credentials: true
- allowedHeaders: Content-Type, Authorization
- methods: GET, POST, PATCH, DELETE

## Content Security Policy

- VERIFY: FD-SEC-014 — Helmet with CSP directives

CSP directives:
- default-src: 'self'
- script-src: 'self'
- style-src: 'self' 'unsafe-inline'
- img-src: 'self' data:
- frame-ancestors: 'none'

## Error Sanitization

- VERIFY: FD-SEC-001 — Sensitive keys redacted in log context
- VERIFY: FD-SEC-002 — sanitizeLogContext handles arrays and deep nesting
- VERIFY: FD-SEC-003 — validateEnvVars checks required environment variables at startup
- VERIFY: FD-SEC-015 — GlobalExceptionFilter sanitizes error responses (no stack traces)

## Row Level Security

Database-level tenant isolation via RLS policies.
See [Data Model Specification](data-model.md) for RLS policy details.

- Every table with ENABLE ROW LEVEL SECURITY must have CREATE POLICY
- Policies use TEXT comparison (no ::uuid cast on TEXT columns)
- Migration sets dummy tenant_id for policy creation

## Tenant Scoping

- VERIFY: FD-SEC-016 — All non-@Public() controllers extract tenant from request
- Controllers use @Req() req and pass req.user.tenantId to service methods
- Monitoring controller methods marked @Public() for system-wide access

## Raw SQL Safety

- VERIFY: FD-SEC-017 — At least one $executeRaw with Prisma.sql template
- Zero $executeRawUnsafe usage anywhere in the codebase

## Convention Safety

- Zero dangerouslySetInnerHTML in frontend code
- Zero console.log in API source code
- Zero hardcoded secret fallbacks
