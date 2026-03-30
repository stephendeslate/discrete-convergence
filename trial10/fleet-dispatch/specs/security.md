# Security Specification

> **Project:** Fleet Dispatch
> **Category:** SEC
> **Related:** See [authentication.md](authentication.md) for JWT auth, see [monitoring.md](monitoring.md) for error handling

---

## Overview

The fleet dispatch API implements defense-in-depth security including Helmet CSP headers, CORS from environment, rate limiting, input validation, and role-based access control. Security measures are applied globally via NestJS providers.

---

## Requirements

### VERIFY:FD-SEC-001 — Helmet with CSP headers

The API bootstrap applies `helmet()` middleware with Content Security Policy headers. This prevents XSS, clickjacking, and other injection attacks.

### VERIFY:FD-SEC-002 — ThrottlerModule rate limiting

ThrottlerModule is configured with named rate limit configs: `default` (100 requests/60s) and `auth` (5 requests/60s). ThrottlerGuard is registered as a global APP_GUARD.

### VERIFY:FD-SEC-003 — CORS from environment

CORS is configured via `enableCors()` with the origin loaded from `process.env['CORS_ORIGIN']`. No hardcoded origins are used.

### VERIFY:FD-SEC-004 — ValidationPipe with strict settings

The global ValidationPipe uses `whitelist: true` and `forbidNonWhitelisted: true` to reject unknown properties. The `transform: true` option is enabled for automatic type coercion.

### VERIFY:FD-SEC-005 — Roles decorator for RBAC

A custom `@Roles()` decorator using `SetMetadata` defines required roles for controller methods. At least 2 endpoints use `@Roles('ADMIN', 'DISPATCHER')` and at least 1 endpoint uses `@Roles('ADMIN')` for administrative operations.

### VERIFY:FD-SEC-006 — RolesGuard for role enforcement

`RolesGuard` is registered as a global APP_GUARD. It checks the `ROLES_KEY` metadata and compares against the authenticated user's role. If no roles are specified, the endpoint is accessible to any authenticated user.

---

## Security Checklist

- [ ] No `as any` casts in source code
- [ ] No `|| 'fallback'` patterns (use `??`)
- [ ] No `$executeRawUnsafe` calls
- [ ] No hardcoded secrets
- [ ] No console.log in production code
- [ ] All user input validated via class-validator
- [ ] Rate limiting on auth endpoints
- [ ] RBAC on destructive operations
