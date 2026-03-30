# Security Specification

## Overview

The Event Management platform implements defense-in-depth security with authentication, authorization,
input validation, rate limiting, and security headers.
Security integrates with the data model RLS described in [data-model.md](data-model.md).
Authentication flow is detailed in [authentication.md](authentication.md).

## Requirements

### EM-SEC-001 — JWT Authentication
All protected endpoints require a valid JWT Bearer token.
Tokens are validated using the JwtStrategy with configurable secret from environment.
JWT secret must not have hardcoded fallback values.
<!-- VERIFY:EM-SEC-001 — JWT authentication enforced on protected endpoints -->

### EM-SEC-002 — Password Hashing
Passwords hashed using bcryptjs (not bcrypt) with 12 salt rounds.
BCRYPT_SALT_ROUNDS constant set to 12 in shared package.
Salt rounds are never configurable at runtime to prevent weakening.
<!-- VERIFY:EM-SEC-002 — Passwords hashed with bcryptjs using 12 salt rounds -->

### EM-SEC-003 — Rate Limiting
Global ThrottlerModule with limit >= 20000 (configured as 100000).
Login endpoint has stricter @Throttle({ default: { ttl: 60000, limit: 10 } }).
ThrottlerGuard registered as APP_GUARD to protect all endpoints.
<!-- VERIFY:EM-SEC-003 — Rate limiting configured with global and per-endpoint limits -->

### EM-SEC-004 — Security Headers
Helmet middleware with CSP directives (defaultSrc, scriptSrc, styleSrc, imgSrc).
frameAncestors set to 'none' to prevent clickjacking.
Applied in main.ts bootstrap function before server starts.
<!-- VERIFY:EM-SEC-004 — Helmet security headers with CSP directives configured -->

### EM-SEC-005 — Input Validation
ValidationPipe with whitelist: true, forbidNonWhitelisted: true, transform: true.
All string DTO fields have @MaxLength decorator.
UUID fields constrained with @MaxLength(36).
Unknown fields in request body are rejected with 400 error.
<!-- VERIFY:EM-SEC-005 — Strict input validation with forbidNonWhitelisted and @MaxLength -->

### EM-SEC-006 — Row Level Security
PostgreSQL RLS with ENABLE + FORCE on all tenanted tables.
Policies filter by current_setting('app.tenant_id', true).
PrismaService.setTenantContext uses $executeRaw (parameterized).
Never uses $executeRawUnsafe for SQL injection prevention.
<!-- VERIFY:EM-SEC-006 — RLS enforced on all tenanted tables with parameterized context -->

### EM-SEC-007 — CORS
CORS enabled via app.enableCors() in main.ts.
Origin configurable via CORS_ORIGIN environment variable.
Credentials, methods, and allowed headers explicitly configured.
<!-- VERIFY:EM-SEC-007 — CORS enabled on API -->

### EM-SEC-008 — Error Sanitization
GlobalExceptionFilter strips stack traces from error responses.
Error responses include correlationId, timestamp, path, statusCode, message.
Internal error details never leaked to clients.
<!-- VERIFY:EM-SEC-008 — edge case: error responses do not leak internal details or stack traces -->

## Security Controls Summary

| Control | Implementation | Layer |
|---------|---------------|-------|
| Authentication | JWT Bearer tokens | Application |
| Authorization | Role-based (ADMIN, ORGANIZER, VIEWER) | Application |
| Tenant Isolation | RLS + TenantGuard | Database + Application |
| Rate Limiting | ThrottlerModule (100000 global, 10 login) | Application |
| Input Validation | class-validator + ValidationPipe | Application |
| Headers | Helmet + CSP | Transport |
| CORS | express CORS middleware | Transport |
