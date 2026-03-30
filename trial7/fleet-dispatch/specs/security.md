# Security Specification

## Overview

Fleet Dispatch implements defense-in-depth security with JWT authentication,
RBAC authorization, input validation, rate limiting, and error sanitization.
See [authentication.md](authentication.md) for auth details.

## Log Sanitization

- VERIFY: FD-SEC-001 — sanitizeLogContext redacts sensitive keys (password, token, secret, authorization, passwordHash, accessToken)
- VERIFY: FD-SEC-002 — sanitizeLogContext handles deep nested objects and arrays recursively

## Authentication Guards

- VERIFY: FD-SEC-003 — JwtAuthGuard as global APP_GUARD, checks @Public() metadata
- VERIFY: FD-SEC-004 — RolesGuard as global APP_GUARD, checks @Roles() metadata against JWT role
- VERIFY: FD-SEC-005 — @Public() decorator sets IS_PUBLIC_KEY metadata to bypass JwtAuthGuard
- VERIFY: FD-SEC-006 — @Roles() decorator sets ROLES_KEY metadata for RolesGuard

## Error Handling

- VERIFY: FD-SEC-007 — GlobalExceptionFilter sanitizes errors, includes correlationId, no stack traces

## Helmet CSP

Content Security Policy directives:
- default-src: 'self'
- script-src: 'self'
- style-src: 'self' 'unsafe-inline'
- img-src: 'self' data:
- frame-ancestors: 'none'

## Rate Limiting

ThrottlerModule with two named configurations:
- default: 100 requests per 60 seconds
- auth: 5 requests per 60 seconds

ThrottlerGuard registered as APP_GUARD.

## CORS Configuration

- Origin from CORS_ORIGIN environment variable (no fallback)
- Credentials enabled
- Explicit methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
- Explicit headers: Content-Type, Authorization, X-Correlation-ID

## Input Validation

ValidationPipe configuration:
- whitelist: true — strip non-whitelisted properties
- forbidNonWhitelisted: true — reject unknown properties
- transform: true — auto-transform types

## DTO Validation Rules

All DTOs use class-validator decorators:
- String fields: @IsString() + @MaxLength()
- UUID fields: @MaxLength(36)
- Email fields: @IsEmail() + @IsString() + @MaxLength()
- Enum fields: @IsIn() with allowed values
- Numeric fields: @IsNumber() or @IsInt() + @Min()
- Optional fields: @IsOptional()
- Date fields: @IsDateString()

## RBAC Matrix

| Role | Vehicles | Drivers | Routes | Dispatches | Maintenance | Audit Logs |
|------|----------|---------|--------|------------|-------------|------------|
| ADMIN | Full CRUD | Full CRUD | Full CRUD | Full CRUD | Full CRUD | Read |
| DISPATCHER | Create/Read/Update | Create/Read/Update | Full CRUD | Create/Read/Update | Read/Create | Create |
| DRIVER | Read | Read | Read | Read | Read | Create |
| VIEWER | Read | Read | Read | Read | Read | None |

## Password Security

- Bcrypt with 12 salt rounds (from shared constant)
- No plaintext storage
- Generic error messages for failed auth
- Rate limited auth endpoints (5 per minute)

## Dependency Audit

- pnpm audit --audit-level=high in CI
- Zero high or critical vulnerabilities required
- Documented exceptions in SECURITY.md if needed
