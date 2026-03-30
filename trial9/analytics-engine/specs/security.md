# Security Specification

## Overview

The Analytics Engine implements defense-in-depth security with JWT authentication,
RBAC, input validation, rate limiting, CORS, CSP headers, and tenant isolation.

See also: [Authentication Specification](authentication.md) for auth flow details.
See also: [Data Model Specification](data-model.md) for RLS policy details.

## Requirements

### Authentication

- VERIFY: AE-SEC-001 — sanitizeLogContext redacts sensitive fields (password, token, secret, authorization) including nested objects and arrays
- VERIFY: AE-SEC-002 — validateEnvVars checks required environment variables at startup
- VERIFY: AE-SEC-003 — main.ts validates required env vars before app initialization

### Middleware

- VERIFY: AE-SEC-004 — Helmet CSP with default-src self, script-src self, style-src self unsafe-inline, img-src self data:, frame-ancestors none
- VERIFY: AE-SEC-005 — CORS configured with CORS_ORIGIN env, credentials true, explicit methods and headers
- VERIFY: AE-SEC-006 — ValidationPipe with whitelist, forbidNonWhitelisted, transform enabled

### Guards

- VERIFY: AE-SEC-007 — JwtAuthGuard as global APP_GUARD with @Public() exemption support
- VERIFY: AE-SEC-008 — RolesGuard checks @Roles() metadata against JWT payload
- VERIFY: AE-SEC-009 — ThrottlerModule with named configs (default: 100/min, auth: 5/min)
- VERIFY: AE-SEC-010 — ThrottlerGuard, JwtAuthGuard, and RolesGuard registered as APP_GUARD
- VERIFY: AE-SEC-011 — Security tests verify authentication enforcement, RBAC, input validation

### Global Providers

- VERIFY: AE-ARCH-002 — GlobalExceptionFilter registered as APP_FILTER, sanitizes errors (no stack traces), includes correlationId
- VERIFY: AE-ARCH-003 — ResponseTimeInterceptor registered as APP_INTERCEPTOR, uses performance.now()

### Rate Limiting

- ThrottlerModule with two named configurations:
  - default: 100 requests per 60 seconds
  - auth: 5 requests per 60 seconds
- ThrottlerGuard as APP_GUARD
- Health and metrics endpoints exempt via @SkipThrottle()

### Input Validation

- All DTO string fields: @IsString() + @MaxLength()
- All DTO UUID fields: @MaxLength(36)
- Email fields: @IsEmail() + @IsString() + @MaxLength(255)
- Registration: @IsIn(ALLOWED_REGISTRATION_ROLES)
- class-validator decorators: >= 10 instances across all DTOs

### Row Level Security

- Every table: ENABLE ROW LEVEL SECURITY + FORCE ROW LEVEL SECURITY
- Every RLS-enabled table: CREATE POLICY for tenant isolation
- Policy uses TEXT comparison (no ::uuid cast) for TEXT tenantId columns

### Error Sanitization

- GlobalExceptionFilter catches all exceptions
- Production responses: statusCode, message, error, correlationId, timestamp
- No stack traces or internal details in responses
- Request bodies sanitized before logging via sanitizeLogContext

### Dependency Security

- bcryptjs (pure JS) instead of bcrypt (native) to avoid tar vulnerability chain
- pnpm audit --audit-level=high in CI pipeline
- Zero high/critical vulnerabilities required
