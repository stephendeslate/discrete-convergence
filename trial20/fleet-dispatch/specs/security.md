# Security Specification

## Overview

Fleet Dispatch implements defense-in-depth security with JWT authentication,
role-based access control, tenant isolation, input validation, rate limiting,
and security headers. No `as any`, no `console.log`, no unsafe patterns.

Cross-references: [authentication.md](authentication.md), [data-model.md](data-model.md)

## Authentication Security

- JWT tokens signed with separate secrets (JWT_SECRET, JWT_REFRESH_SECRET)
- Access tokens expire in 1 hour, refresh tokens in 7 days
- Passwords hashed with bcryptjs at BCRYPT_SALT_ROUNDS (12)
- No ADMIN self-registration (ALLOWED_REGISTRATION_ROLES = VIEWER, DISPATCHER)
- Token validation via passport-jwt strategy

## Role-Based Access Control

Three roles with hierarchical permissions:
- ADMIN: full CRUD on all entities, delete operations
- DISPATCHER: read/create/update on all entities, no delete
- VIEWER: read access on all entities

Enforcement via APP_GUARD chain:
1. ThrottlerGuard — rate limiting (100/s short, 500/10s medium, 2000/60s long)
2. JwtAuthGuard — token validation (skipped for @Public() routes)
3. RolesGuard — role checking (skipped when no @Roles() decorator)

## Tenant Isolation

- Application-level: all queries filtered by tenantId from JWT payload
- Database-level: PostgreSQL RLS policies on all tables
- tenantId stored as TEXT (not UUID) for flexible tenant identifiers
- No cross-tenant data leakage in findOne (verified tenantId match)

## Input Validation

- class-validator DTOs with whitelist: true, forbidNonWhitelisted: true
- Extra fields rejected with 400 Bad Request
- @IsEmail, @IsString, @MinLength, @IsOptional, @IsIn for type safety
- transform: true for automatic type coercion

## Security Headers

- x-powered-by disabled via express disable()
- helmet with Content-Security-Policy (default-src 'self')
- frameAncestors: 'none' (clickjacking prevention)
- CORS restricted to CORS_ORIGIN environment variable
- X-Correlation-ID propagated through request chain

## Error Handling

- GlobalExceptionFilter sanitizes error context via sanitizeLogContext()
- Passwords, tokens, secrets stripped from log output
- Error responses include correlationId for traceability
- Stack traces not exposed in production responses

Cross-references: [monitoring.md](monitoring.md), [infrastructure.md](infrastructure.md)

## VERIFY Tags

- VERIFY: FD-SEC-001 — Button component supports variant and size props
- VERIFY: FD-SEC-002 — Accessibility tests validate ARIA attributes
- VERIFY: FD-SEC-003 — Utility cn function merges Tailwind classes
- VERIFY: FD-SEC-004 — Layout includes lang attribute and metadata
- VERIFY: FD-SEC-005 — Roles guard checks RBAC before handler execution
- VERIFY: FD-SEC-006 — Global exception filter sanitizes error context

## Frontend Security

- httpOnly cookies for token storage (not localStorage)
- Secure flag in production
- SameSite: lax for CSRF mitigation
- No sensitive data in client-side state
