# Security Specification

> **Project:** Event Management
> **Domain:** SEC
> **VERIFY Tags:** EM-SEC-001 – EM-SEC-005

---

## Overview

Defense-in-depth security with HTTP security headers (Helmet), rate limiting
(ThrottlerModule), CORS restrictions, input validation, and secret management.
All security controls are configured at the application level and enforced
globally.

---

## Requirements

### EM-SEC-001: Helmet CSP Configuration

<!-- VERIFY: EM-SEC-001 -->

- Helmet middleware applied in `main.ts`.
- Content-Security-Policy: `default-src 'self'`.
- `frame-ancestors: 'none'` to prevent clickjacking.
- Additional HTTP security headers set by Helmet defaults.

### EM-SEC-002: ThrottlerModule Configuration

<!-- VERIFY: EM-SEC-002 -->

- ThrottlerModule registered in AppModule with multi-tier limits.
- `short.limit >= 20000` to support load testing without false 429s.
- ThrottlerGuard registered as APP_GUARD for global enforcement.
- Individual endpoints can override with `@Throttle()` decorator.

### EM-SEC-003: CORS from Environment Variable

<!-- VERIFY: EM-SEC-003 -->

- CORS origin configured from `CORS_ORIGIN` environment variable.
- `credentials: true` enabled for cookie-based authentication.
- No wildcard origins in production.

### EM-SEC-004: ValidationPipe Configuration

<!-- VERIFY: EM-SEC-004 -->

- Global `ValidationPipe` with `whitelist: true`.
- `forbidNonWhitelisted: true` rejects unknown properties.
- `transform: true` enables automatic type transformation.
- Malformed request bodies return 400 Bad Request.

### EM-SEC-005: No Hardcoded Secret Fallbacks

<!-- VERIFY: EM-SEC-005 -->

- JWT_SECRET sourced exclusively from environment variables.
- JWT_REFRESH_SECRET sourced exclusively from environment variables.
- No `|| 'default-secret'` or similar fallback patterns.
- Application refuses to start if secrets are missing.
