# Security Specification

> **Project:** Analytics Engine
> **Category:** SEC
> **Related:** See [authentication.md](authentication.md) for JWT and auth guards, see [monitoring.md](monitoring.md) for error handling

---

## Overview

The analytics engine implements defense-in-depth security with Helmet CSP headers, CORS restrictions, rate limiting via NestJS Throttler, and input validation via ValidationPipe. All security measures are configured in `main.ts` bootstrap or registered as global NestJS providers.

---

## Requirements

### VERIFY:AE-SEC-001 — Helmet CSP configuration

Helmet is applied in the NestJS bootstrap function with Content Security Policy directives: `defaultSrc: ["'self'"]`, `scriptSrc: ["'self'"]`, `styleSrc: ["'self'", "'unsafe-inline'"]`, `imgSrc: ["'self'", "data:"]`, `frameAncestors: ["'none'"]`. Helmet is imported and applied via `app.use(helmet({ contentSecurityPolicy: { directives: { ... } } }))`.

### VERIFY:AE-SEC-002 — ThrottlerModule with named configs

Rate limiting uses `ThrottlerModule.forRoot()` with two named configurations: `default` (100 requests per 60 seconds) and `auth` (5 requests per 60 seconds). `ThrottlerGuard` is registered as a global `APP_GUARD`. The guard is applied before the JWT auth guard in the provider chain.

### VERIFY:AE-SEC-003 — CORS from environment variable

CORS is configured using `app.enableCors()` with `origin` set to `process.env['CORS_ORIGIN']` — no hardcoded fallback. Credentials are enabled. Allowed headers include `Content-Type`, `Authorization`, and `X-Correlation-ID`. Allowed methods are GET, POST, PUT, PATCH, DELETE, OPTIONS.

### VERIFY:AE-SEC-004 — ValidationPipe with strict options

The global `ValidationPipe` is configured with `whitelist: true` (strips unknown properties), `forbidNonWhitelisted: true` (rejects requests with unknown properties), and `transform: true` (auto-transforms payloads to DTO class instances). This prevents mass assignment attacks and ensures type safety.

---

## Security Layers

```
Request → Helmet (CSP headers)
       → CORS (origin check)
       → ThrottlerGuard (rate limit)
       → JwtAuthGuard (authentication)
       → RolesGuard (authorization)
       → ValidationPipe (input validation)
       → Controller (business logic)
```
