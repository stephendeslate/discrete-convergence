# Security Specification

## VERIFY:EM-SEC-001 — Roles Decorator
@Roles() decorator sets metadata for RolesGuard to check against.

## VERIFY:EM-SEC-002 — Input Validation
ValidationPipe with whitelist, forbidNonWhitelisted, transform.
All DTOs use class-validator decorators.

## VERIFY:EM-SEC-003 — Roles Guard
RolesGuard checks user.role against required roles from @Roles() metadata.
Allows access if no roles specified (open to authenticated users).

## Access Control Matrix

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

## Security Headers

Helmet middleware applies security headers (X-Frame-Options, CSP, etc.).

## Rate Limiting

ThrottlerModule configured at 100 requests per 60 seconds per IP.

## Tenant Isolation

All data queries scoped by tenantId from JWT payload.
Service layer enforces tenant boundary checks before returning data.
