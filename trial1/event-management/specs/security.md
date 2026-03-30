# Security Specification

> **Project:** Event Management
> **Category:** SEC
> **Cross-references:** See [authentication.md](authentication.md), [monitoring.md](monitoring.md)

---

## Requirements

### VERIFY:EM-SEC-001 — Helmet

Helmet middleware with Content Security Policy applied in `main.ts` bootstrap before listen.
CSP directives:
- `default-src 'self'`
- `script-src 'self'`
- `style-src 'self' 'unsafe-inline'`
- `img-src 'self' data:`
- `frame-ancestors 'none'`

Helmet is applied before any other middleware to ensure all responses include security headers.

### VERIFY:EM-SEC-002 — Rate Limiting

ThrottlerModule with two named configurations:
- `default`: 100 requests per 60 seconds (general API protection)
- `auth`: 5 requests per 60 seconds (brute-force prevention on login/register)

Registered globally in AppModule. ThrottlerGuard provided as `APP_GUARD`.
Health and metrics endpoints skip throttling via `@SkipThrottle()` decorator.
See [authentication.md](authentication.md) for guard chain ordering.

### VERIFY:EM-SEC-003 — CORS

CORS origin from `process.env['CORS_ORIGIN']`. Configuration:
- No wildcard origin in production
- `credentials: true` for cookie/auth header support
- Explicit `allowedHeaders` and `methods` lists
- Configured in `main.ts` bootstrap via `app.enableCors()`

No hardcoded fallback origin — CORS_ORIGIN must be set via environment variable.

### VERIFY:EM-SEC-004 — Validation

Global ValidationPipe with:
- `whitelist: true` — strips unknown properties from request body
- `forbidNonWhitelisted: true` — returns 400 for unexpected fields
- `transform: true` — enables implicit type transformation

Applied globally in `main.ts` via `app.useGlobalPipes()`. All DTOs use class-validator
decorators for field-level validation. See [api-endpoints.md](api-endpoints.md) for
DTO validation patterns.

---

## Verification Checklist

- [ ] Helmet applied in main.ts with CSP directives
- [ ] ThrottlerModule has both 'default' and 'auth' named configs
- [ ] ThrottlerGuard registered as APP_GUARD in AppModule
- [ ] CORS_ORIGIN from environment, no hardcoded fallback
- [ ] ValidationPipe has whitelist, forbidNonWhitelisted, transform
- [ ] pnpm audit --audit-level=high in CI workflow
