# Security Specification

## Overview

The Analytics Engine implements defense-in-depth security with JWT authentication,
RBAC, input validation, rate limiting, CORS, CSP headers, and row-level security.

See also: [Authentication](authentication.md) for JWT and password hashing details.
See also: [Data Model](data-model.md) for RLS policy definitions.

## Authentication Layer

- JWT-based authentication with global APP_GUARD
- bcryptjs for password hashing (salt rounds: 12)
- @Public() decorator for exempt routes
- Token expiry: 1 hour

## Authorization (RBAC)

- RolesGuard as APP_GUARD checks @Roles() metadata
- ADMIN: full CRUD including delete and data source management
- USER: create and read operations
- VIEWER: read-only access

## Input Validation

VERIFY: AE-SEC-001
Sensitive keys list for log sanitization includes password, token, authorization, etc.

VERIFY: AE-SEC-002
sanitizeLogContext redacts sensitive fields recursively including arrays.

VERIFY: AE-SEC-003
validateEnvVars checks required environment variables at startup.

VERIFY: AE-SEC-004
Application bootstrap validates DATABASE_URL, JWT_SECRET, CORS_ORIGIN.

## Security Headers

VERIFY: AE-SEC-005
Helmet.js with CSP: default-src self, script-src self, style-src self unsafe-inline,
img-src self data:, frame-ancestors none.

## CORS

VERIFY: AE-SEC-006
CORS configured from CORS_ORIGIN env with credentials true and explicit methods/headers.

## Validation Pipeline

VERIFY: AE-SEC-007
ValidationPipe with whitelist, forbidNonWhitelisted, transform enabled globally.

## Rate Limiting

VERIFY: AE-SEC-008
ThrottlerModule with default (100/60s) and auth (5/60s) named configs.

## Error Handling

VERIFY: AE-SEC-009
GlobalExceptionFilter sanitizes request body before logging, no stack traces in responses.

## Row Level Security

All tables have ENABLE ROW LEVEL SECURITY, FORCE ROW LEVEL SECURITY, and
CREATE POLICY for tenant isolation. Policies use direct TEXT comparison
(no ::uuid cast on TEXT columns).

## Dependency Security

- bcryptjs used instead of bcrypt (eliminates tar vulnerability chain)
- pnpm.overrides for effect>=3.20.0 (Prisma transitive fix)
- pnpm audit --prod must report 0 high/critical

## Multi-Tenant Isolation

Every domain controller extracts tenant context from request user.
All service methods scope queries by tenantId.
Monitoring controller uses @Public() on all methods (system-wide endpoints).
