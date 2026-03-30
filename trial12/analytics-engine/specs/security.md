# Security Specification

## Overview

The Analytics Engine enforces defense-in-depth security: JWT authentication via global
APP_GUARD, role-based authorization, environment validation at startup, tenant isolation
via Row Level Security, input validation, and HTTP hardening with Helmet.

See also: [Authentication](authentication.md) for JWT and login flow details.
See also: [Infrastructure](infrastructure.md) for RLS migration details.

## Environment Validation

- VERIFY: AE-SEC-001 — validateEnvVars checks required variables at startup and throws if any are missing

## Public Route Decorator

- VERIFY: AE-SEC-002 — @Public() decorator sets IS_PUBLIC_KEY metadata via SetMetadata

## Roles Decorator

- VERIFY: AE-SEC-003 — @Roles() decorator sets ROLES_KEY metadata via SetMetadata

## Roles Guard

- VERIFY: AE-SEC-004 — RolesGuard reads ROLES_KEY from reflector; if no roles required, allows access; otherwise checks user role is included

## JWT Auth Guard

- VERIFY: AE-SEC-005 — JwtAuthGuard extends AuthGuard('jwt'), checks IS_PUBLIC_KEY reflector to skip auth on @Public() routes

## Application Bootstrap Security

- VERIFY: AE-SEC-006 — main.ts calls validateEnvVars, enables Helmet with CSP, configures CORS from env, sets up ValidationPipe with whitelist + forbidNonWhitelisted + transform

## Security Principles

1. No hardcoded JWT_SECRET fallback — startup fails if missing
2. No `$executeRawUnsafe` — only `$executeRaw` with Prisma.sql template tags
3. No `as any` type assertions
4. No `|| 'value'` environment variable fallbacks
5. No stack traces in error responses
6. httpOnly cookie for token storage in frontend
7. CORS restricted to CORS_ORIGIN env var
8. ThrottlerModule with stricter limits on auth endpoints (5/min)
9. ValidationPipe rejects unknown fields (forbidNonWhitelisted)
10. GlobalExceptionFilter sanitizes all error output
