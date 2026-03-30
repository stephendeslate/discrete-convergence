# Security Specification

## Overview

Security is enforced at multiple layers: authentication (JWT), authorization
(RBAC guards), input validation (class-validator), transport security
(Helmet CSP, CORS), rate limiting (ThrottlerModule), and data isolation
(Row Level Security).

## Requirements

### SEC-001: Allowed Registration Roles

- VERIFY: EM-SEC-001 — ALLOWED_REGISTRATION_ROLES constant restricts
  self-registration to USER and ORGANIZER roles only. ADMIN role
  assignment requires direct database access.

### SEC-002: Environment Validation

- VERIFY: EM-SEC-002 — validateEnvVars() from the shared package checks
  for required environment variables at startup and throws descriptive
  errors for any missing configuration.

### SEC-003: Public Decorator

- VERIFY: EM-SEC-003 — @Public() decorator sets IS_PUBLIC_KEY metadata
  to bypass the global JwtAuthGuard on specific endpoints (auth, monitoring).

### SEC-004: Roles Decorator

- VERIFY: EM-SEC-004 — @Roles() decorator sets ROLES_KEY metadata used by
  the RolesGuard to enforce role-based access control on controller methods.

### SEC-005: Roles Guard

- VERIFY: EM-SEC-005 — RolesGuard checks the user's role from the JWT
  payload against the required roles set by @Roles() decorator. Returns
  true if no roles are required (open to all authenticated users).

### SEC-006: JWT Auth Guard

- VERIFY: EM-SEC-006 — JwtAuthGuard extends the Passport AuthGuard and
  checks for IS_PUBLIC_KEY metadata. Public endpoints bypass authentication;
  all others require a valid JWT.

### SEC-007: Application Bootstrap Security

- VERIFY: EM-SEC-007 — main.ts configures Helmet with CSP directives,
  CORS with configurable origins, and ValidationPipe with whitelist and
  forbidNonWhitelisted for input sanitization. Also calls validateEnvVars().

### SEC-008: Security Test Suite

- VERIFY: EM-SEC-008 — Security integration tests verify: unauthenticated
  requests return 401, role-based access returns 403 for insufficient roles,
  input validation rejects malformed payloads, and log sanitization strips
  sensitive fields.

## Threat Mitigations

| Threat | Mitigation |
|--------|-----------|
| Credential theft | bcryptjs with 12 rounds, JWT expiration |
| Privilege escalation | ALLOWED_REGISTRATION_ROLES, RolesGuard |
| Injection | ValidationPipe, Prisma parameterized queries |
| XSS | Helmet CSP headers |
| CSRF | SameSite cookies, Bearer token auth |
| Brute force | ThrottlerModule with named rate limit configs |
| Data leakage | Log sanitization, no plaintext passwords |
| Tenant isolation | PostgreSQL RLS on all 6 tables |

## Multi-Tenant Isolation

- All controllers extract tenantId from the authenticated user's JWT.
- Every database query filters by tenantId at the application layer.
- PostgreSQL RLS provides defense-in-depth at the database layer.
- RLS policies use TEXT comparison (no ::uuid cast on TEXT columns).
