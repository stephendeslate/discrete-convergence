# Security Specification

## Overview
The Event Management Platform implements defense-in-depth security.
See [authentication.md](authentication.md) for auth details.

## Authentication Guards
- JwtAuthGuard as APP_GUARD (global)
- ThrottlerGuard as APP_GUARD (global)
- RolesGuard as APP_GUARD (global)
- @Public() decorator bypasses JwtAuthGuard
- @Roles() decorator restricts by user role

## Role-Based Access Control
- @Roles('ADMIN', 'ORGANIZER') on event create/update/publish/cancel
- @Roles('ADMIN') on event delete, organization update, audit log
- @Roles('ADMIN', 'ORGANIZER') on check-in, waitlist, notification broadcast
- Registration role restricted to ATTENDEE via @IsIn(ALLOWED_REGISTRATION_ROLES)

## Rate Limiting (ThrottlerModule)
- Short: 100 requests per 1 second
- Medium: 500 requests per 10 seconds
- Long: 2000 requests per 60 seconds
- Login/register: @Throttle({short:{ttl:1000,limit:10}})

## Input Validation
- Global ValidationPipe with whitelist and forbidNonWhitelisted
- All DTOs use class-validator decorators
- @IsString() + @MaxLength() on string fields
- @MaxLength(36) on UUID fields
- @IsEmail() on email fields
- @IsInt() + @Min() on numeric fields
- @IsDateString() on date fields
- No $executeRawUnsafe anywhere

## Password Security
- bcryptjs (NOT bcrypt) for hashing
- BCRYPT_SALT_ROUNDS = 12 from shared package
- Minimum 8 characters, maximum 128

## HTTP Security
- Helmet middleware with CSP
- frame-ancestors: 'none'
- x-powered-by disabled
- CORS with configurable origin
- httpOnly cookies for auth tokens

## Row-Level Security
- ENABLE + FORCE + CREATE POLICY on tenant tables
- tenant_id as TEXT (no ::uuid cast)
- $executeRaw for set_config (no $executeRawUnsafe)

## Cross-References
- [authentication.md](authentication.md) — JWT configuration
- [api-endpoints.md](api-endpoints.md) — Endpoint-level security
- [infrastructure.md](infrastructure.md) — Environment variables
- [data-model.md](data-model.md) — RLS policies

## VERIFY Tags
VERIFY: EM-SEC-001 — Number of salt rounds for bcryptjs hashing
VERIFY: EM-SEC-002 — Roles allowed during registration
VERIFY: EM-SEC-003 — Remove sensitive fields from log context
VERIFY: EM-SEC-004 — Row-Level Security for multi-tenant isolation (RLS migration)
VERIFY: EM-SEC-005 — Set tenant context for RLS via $executeRaw
VERIFY: EM-SEC-006 — Mark a route as public (bypass JWT auth)
VERIFY: EM-SEC-007 — Restrict endpoint to specific roles
VERIFY: EM-SEC-008 — RolesGuard enforces role-based access
VERIFY: EM-SEC-009 — Login DTO with validated fields
VERIFY: EM-SEC-010 — Register DTO with role validation
VERIFY: EM-SEC-011 — Global JWT guard, skips @Public() routes
VERIFY: EM-SEC-012 — Security-focused negative tests
VERIFY: EM-EDGE-001 — Edge case test suite
VERIFY: EM-EDGE-002 — Past event handling
VERIFY: EM-EDGE-003 — Sold-out venue rejection
VERIFY: EM-EDGE-004 — Status transition validation
VERIFY: EM-EDGE-005 — Timezone handling (UTC storage)
VERIFY: EM-EDGE-006 — Idempotent check-in
VERIFY: EM-EDGE-007 — Session within event window
VERIFY: EM-EDGE-008 — Registration on non-open event
VERIFY: EM-EDGE-009 — Cancel after check-in rejection
VERIFY: EM-EDGE-010 — Zero-duration event rejection

## Conventions (Zero Tolerance)
- Zero `as any` casts
- Zero `console.log` statements
- Zero `||` fallbacks (use `??` instead)
- Zero `$executeRawUnsafe` calls
- Zero `dangerouslySetInnerHTML`
- All findFirst calls have justification comments
