# Security Specification

## Overview

Fleet Dispatch implements defense-in-depth security with JWT authentication,
role-based access control, Row Level Security, input validation, and rate limiting.

## Authentication Guards

### JwtAuthGuard (APP_GUARD)
- Extends Passport AuthGuard('jwt')
- Checks @Public() decorator via Reflector
- Applied globally via APP_GUARD provider

<!-- VERIFY: FD-SEC-001 — JwtAuthGuard registered as APP_GUARD in AppModule -->

### ThrottlerGuard (APP_GUARD)
- NestJS ThrottlerModule with 100 req/sec default
- Auth endpoints override to 10 req/sec via @Throttle
- Health endpoints are NOT @SkipThrottle

<!-- VERIFY: FD-SEC-002 — ThrottlerModule configured with 100/sec limit -->

### RolesGuard (APP_GUARD)
- Custom guard checking @Roles() decorator
- Returns true if no roles specified (default allow)
- Used on: Vehicle DELETE, Driver DELETE, Audit Log list

<!-- VERIFY: FD-SEC-003 — RolesGuard checks Reflector for ROLES_KEY -->

## Row Level Security

- All 14 tables have ENABLE + FORCE ROW LEVEL SECURITY
- Policies check tenant_id = current_setting('app.tenant_id', true)
- PrismaService.setTenantContext uses $executeRaw with Prisma.sql template

<!-- VERIFY: FD-SEC-004 — PrismaService.setTenantContext uses $executeRaw (not $executeRawUnsafe) -->

## Input Validation

- Global ValidationPipe with whitelist: true, forbidNonWhitelisted: true
- All DTOs use class-validator decorators
- String lengths capped with @MaxLength

<!-- VERIFY: FD-SEC-005 — ValidationPipe configured with whitelist and forbidNonWhitelisted -->

## HTTP Security Headers

- Helmet middleware applied in main.ts
- CORS configured with specific origin
- X-Correlation-ID for request tracing

<!-- VERIFY: FD-SEC-006 — Helmet middleware applied before route handlers -->

## Exception Handling

- GlobalExceptionFilter catches all exceptions
- Never exposes stack traces in production
- Sanitizes log context using sanitizeLogContext from shared
- Includes correlationId in error responses
