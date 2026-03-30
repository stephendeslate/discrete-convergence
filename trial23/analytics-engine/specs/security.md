# Security Specification

> **Project:** Analytics Engine
> **Category:** SEC
> **Related:** See [authentication.md](authentication.md) for JWT auth, see [monitoring.md](monitoring.md) for log sanitization, see [api-endpoints.md](api-endpoints.md) for endpoint protection

---

## Overview

The analytics engine implements defense-in-depth security: Helmet.js for HTTP headers, ThrottlerModule for rate limiting, CORS with explicit origin configuration, ValidationPipe for input sanitization, and Row Level Security for data isolation. All security components are configured through NestJS dependency injection — never bypassed via middleware shortcuts.

---

## Requirements

### VERIFY: AE-SEC-001 — Helmet CSP with default-src 'self', frame-ancestors 'none'

Helmet.js is configured in `main.ts` with Content Security Policy directives: `default-src 'self'` restricts all resource loading to the same origin, `script-src 'self'` prevents inline scripts and external script loading, `style-src 'self' 'unsafe-inline'` allows same-origin and inline styles for component libraries, `img-src 'self' data:` allows same-origin images and data URIs, and `frame-ancestors 'none'` prevents the application from being embedded in iframes (clickjacking protection). Helmet is applied in the `main.ts` bootstrap function before any route handlers are registered to ensure all responses include security headers.

### VERIFY: AE-SEC-002 — ThrottlerModule short.limit>=20000 for load test

ThrottlerModule is configured in `AppModule` imports with rate limit settings. The `short` (or default) configuration has `limit` set to at least 20000 to allow load testing tools like autocannon to run without hitting 429 Too Many Requests errors during performance tests. The `ttl` is set to 60000 milliseconds (60 seconds). Authentication endpoints override this with a stricter limit via `@Throttle()` decorator. ThrottlerGuard is registered as an `APP_GUARD` to enforce rate limiting globally across all endpoints.

### VERIFY: AE-SEC-003 — CORS from CORS_ORIGIN env var, credentials true

CORS is configured in `main.ts` using the `CORS_ORIGIN` environment variable with no fallback value. The configuration includes `credentials: true` to allow cookies and authorization headers in cross-origin requests, explicit `allowedHeaders` array including `Content-Type`, `Authorization`, and `X-Correlation-ID`, and explicit `methods` array with `GET`, `POST`, `PATCH`, `DELETE`, `OPTIONS`. The CORS origin is never hardcoded in source code and never uses a `||` fallback pattern — it must come from the validated environment variable.

### VERIFY: AE-SEC-004 — ValidationPipe whitelist + forbidNonWhitelisted

The global `ValidationPipe` is configured with three strict options: `whitelist: true` automatically strips any properties not defined in the DTO class, `forbidNonWhitelisted: true` rejects requests that contain unknown properties with a 400 Bad Request error instead of silently stripping them, and `transform: true` automatically transforms plain objects to DTO class instances. This prevents mass assignment attacks and ensures only explicitly declared fields reach the service layer.

### VERIFY: AE-SEC-005 — No hardcoded secret fallbacks in env vars

No environment variable in the codebase uses a hardcoded string fallback via the `||` operator. For example, `process.env.JWT_SECRET || 'my-secret'` is forbidden. All secret access uses either `process.env.JWT_SECRET` with validation via `validateEnvVars()`, or the nullish coalescing operator `??` with a non-secret default for optional non-sensitive values. The `validateEnvVars()` function from the shared package terminates the process if required secrets are missing, ensuring the application never runs with placeholder credentials.

---

## Security Layers

| Layer | Mechanism | Scope |
|-------|-----------|-------|
| HTTP Headers | Helmet.js + CSP | All responses |
| Rate Limiting | ThrottlerGuard (APP_GUARD) | All endpoints |
| Authentication | JwtAuthGuard (APP_GUARD) | All non-@Public endpoints |
| Input Validation | ValidationPipe (global) | All request bodies |
| Data Isolation | PostgreSQL RLS | All tenant-scoped queries |
| Secret Management | Environment variables | No hardcoded secrets |
| Dependency Audit | pnpm audit in CI | Build pipeline |

---

## Threat Model

| Threat | Mitigation |
|--------|------------|
| SQL injection | Prisma parameterized queries, zero $executeRawUnsafe |
| XSS | Helmet CSP, zero dangerouslySetInnerHTML |
| CSRF | JWT auth (stateless), CORS enforcement |
| Brute force | ThrottlerGuard with auth-specific @Throttle limits |
| Data leakage | RLS, log sanitization, no secrets in responses |
| Clickjacking | frame-ancestors 'none' in CSP |
| Mass assignment | ValidationPipe whitelist + forbidNonWhitelisted |

---

## Validation Rules

All DTO string fields require both `@IsString()` and `@MaxLength()` decorators. UUID fields use `@MaxLength(36)`. Email fields require `@IsEmail()`, `@IsString()`, and `@MaxLength(255)`. The registration role field uses `@IsIn(ALLOWED_REGISTRATION_ROLES)` from the shared package to prevent ADMIN self-registration.
