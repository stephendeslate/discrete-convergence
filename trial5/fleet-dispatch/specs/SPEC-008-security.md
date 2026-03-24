# SPEC-008: Security

**Status:** APPROVED
**Domain:** Security & Access Control
**Cross-references:** [SPEC-001](SPEC-001-authentication.md), [SPEC-006](SPEC-006-multi-tenancy.md)

## Overview

Fleet Dispatch implements defense-in-depth security across authentication,
authorization, input validation, rate limiting, and HTTP security headers.

## Authentication

- JWT-based authentication via Passport.js
- `JwtAuthGuard` registered as global `APP_GUARD`
- Public endpoints opt out via `@Public()` decorator
- Token extracted from `Authorization: Bearer` header

<!-- VERIFY:FD-SEC-001 — public route decorator to bypass JWT auth guard -->
<!-- VERIFY:FD-SEC-003 — JWT auth guard with @Public() bypass -->

## Role-Based Access Control (RBAC)

Three roles with hierarchical permissions:
- `ADMIN` — full access to all resources and tenant management
- `DISPATCHER` — create/update vehicles, drivers, deliveries, routes; view audit logs
- `DRIVER` — read-only access to assigned resources

`RolesGuard` registered as global `APP_GUARD`. Endpoints without `@Roles()` allow
any authenticated user.

<!-- VERIFY:FD-SEC-002 — roles decorator for RBAC enforcement -->
<!-- VERIFY:FD-SEC-004 — RBAC roles guard -->

## Input Validation

- Global `ValidationPipe` with `whitelist: true` strips unknown properties
- `forbidNonWhitelisted: true` rejects payloads with unknown fields
- `transform: true` enables automatic type transformation
- All DTOs use `class-validator` decorators

## Rate Limiting

- `ThrottlerModule` configured as global guard
- Default: 100 requests per 60 seconds per IP
- Protects against brute-force and abuse

## HTTP Security Headers

- Helmet middleware applied globally
- Protects against XSS, clickjacking, MIME sniffing, etc.

## CORS

- Configurable origin via `CORS_ORIGIN` environment variable
- Credentials enabled for cookie-based auth
- Default: `http://localhost:3000`

## Row Level Security

- RLS enabled on all tenant-scoped tables in PostgreSQL
- Provides database-level tenant isolation as defense-in-depth
- Application-level filtering is the primary mechanism

## Error Handling

- `GlobalExceptionFilter` catches all exceptions
- Sensitive data is sanitized from error logs via `sanitizeLogContext()`
- Error responses include `correlationId` for debugging
- Stack traces are never exposed to clients

<!-- VERIFY:FD-MON-004 — log context sanitization for sensitive fields -->
<!-- VERIFY:FD-MON-008 — global exception filter with sanitized errors -->
