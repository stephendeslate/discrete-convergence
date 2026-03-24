# Security Specification

> **Project:** Analytics Engine
> **Category:** SEC
> **Related:** See [authentication.md](authentication.md) for JWT auth, see [monitoring.md](monitoring.md) for log sanitization, see [api-endpoints.md](api-endpoints.md) for endpoint protection

---

## Overview

The analytics engine implements defense-in-depth security: Helmet.js for HTTP headers, ThrottlerModule for rate limiting, CORS with explicit origin configuration, ValidationPipe for input sanitization, and Row Level Security for data isolation. All security components are configured through NestJS dependency injection — never bypassed via middleware shortcuts.

---

## Requirements

### VERIFY:AE-SEC-001 — Helmet CSP configuration

Helmet.js is configured with Content Security Policy: `default-src 'self'`, `script-src 'self'`, `style-src 'self' 'unsafe-inline'`, `img-src 'self' data:`, `frame-ancestors 'none'`. Helmet is applied in `main.ts` bootstrap before any route handlers are registered.

### VERIFY:AE-SEC-002 — ThrottlerModule with named configs

ThrottlerModule is configured with TWO named rate limit configurations: `{ name: 'default', ttl: 60000, limit: 100 }` for general API access and `{ name: 'auth', ttl: 60000, limit: 5 }` for authentication endpoints. ThrottlerGuard is registered as an `APP_GUARD` to enforce rate limiting globally.

### VERIFY:AE-SEC-003 — CORS from environment variable

CORS is configured using the `CORS_ORIGIN` environment variable with no fallback value. Configuration includes `credentials: true` and explicit `allowedHeaders` and `methods` arrays. The CORS origin is never hardcoded and never uses a `||` fallback pattern.

### VERIFY:AE-SEC-004 — ValidationPipe with strict options

The global `ValidationPipe` is configured with `whitelist: true` (strips unknown properties), `forbidNonWhitelisted: true` (rejects unknown properties), and `transform: true` (auto-transforms payloads to DTO instances). This prevents mass assignment and injection attacks.

---

## Security Layers

| Layer | Mechanism | Scope |
|-------|-----------|-------|
| HTTP Headers | Helmet.js + CSP | All responses |
| Rate Limiting | ThrottlerGuard (APP_GUARD) | All endpoints |
| Authentication | JwtAuthGuard (APP_GUARD) | All non-@Public endpoints |
| Input Validation | ValidationPipe | All request bodies |
| Data Isolation | PostgreSQL RLS | All tenant-scoped queries |
| Secret Management | Environment variables | No hardcoded secrets |
| Dependency Audit | pnpm audit in CI | Build pipeline |

---

## Validation Rules

All DTO string fields require both `@IsString()` and `@MaxLength()` decorators. UUID fields require `@MaxLength(36)`. Email fields require `@IsEmail()`, `@IsString()`, and `@MaxLength()`. Registration role field uses `@IsIn(ALLOWED_REGISTRATION_ROLES)` to prevent ADMIN self-registration.

---

## Threat Model

| Threat | Mitigation |
|--------|------------|
| SQL injection | Prisma parameterized queries, zero $executeRawUnsafe |
| XSS | Helmet CSP, zero dangerouslySetInnerHTML |
| CSRF | JWT auth (stateless), CORS enforcement |
| Brute force | ThrottlerGuard with auth-specific limits |
| Data leakage | RLS, log sanitization, no secrets in responses |
