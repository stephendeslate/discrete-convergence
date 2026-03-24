# SPEC-008: Security

**Status:** APPROVED
**Priority:** P0
**Cross-References:** SPEC-001 (Authentication), SPEC-006 (Multi-Tenancy)

## Overview

Comprehensive security measures including RBAC, input validation, rate limiting,
HTTP security headers, and Row Level Security.

## Requirements

### VERIFY:EM-SEC-001 — Roles Decorator
@Roles() decorator sets ROLES_KEY metadata for role-based access control.

### VERIFY:EM-SEC-002 — Input Validation
ValidationPipe configured globally with whitelist: true and forbidNonWhitelisted: true.
All DTOs use class-validator decorators for field validation.

### VERIFY:EM-SEC-003 — Roles Guard
RolesGuard checks user role from JWT against @Roles() metadata. If no roles specified
on handler, access is granted (open to any authenticated user).

### VERIFY:EM-SEC-004 — Rate Limiting
ThrottlerModule configured as APP_GUARD with 100 requests per 60 seconds.

### VERIFY:EM-SEC-005 — HTTP Security Headers
Helmet middleware applied globally for secure HTTP headers (X-Frame-Options,
Content-Security-Policy, X-Content-Type-Options, etc.).

### VERIFY:EM-SEC-006 — Row Level Security
All database tables have RLS enabled with FORCE ROW LEVEL SECURITY.
Policies defined in migration SQL for defense-in-depth.

## RBAC Matrix

| Resource | ADMIN | ORGANIZER | VIEWER |
|----------|-------|-----------|--------|
| Events (read) | Yes | Yes | Yes |
| Events (create/update) | Yes | Yes | No |
| Events (delete) | Yes | No | No |
| Venues (read) | Yes | Yes | Yes |
| Venues (create/update) | Yes | Yes | No |
| Venues (delete) | Yes | No | No |
| Tickets (read) | Yes | Yes | Yes |
| Tickets (create/update) | Yes | Yes | No |
| Tickets (delete) | Yes | No | No |
| Attendees (read) | Yes | Yes | Yes |
| Attendees (create/update) | Yes | Yes | No |
| Attendees (delete) | Yes | No | No |
| Tenants (all) | Yes | No | No |
| Audit Logs (read) | Yes | No | No |

## Error Handling

GlobalExceptionFilter catches all exceptions and returns sanitized error responses
with correlationId, statusCode, message, and timestamp. Sensitive fields are redacted
from log context via sanitizeLogContext.
