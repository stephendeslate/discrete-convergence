# Security Specification

## Overview

FleetDispatch implements defense-in-depth security with tenant isolation,
input validation, rate limiting, and security headers.

## Tenant Isolation

- VERIFY:FD-SEC-004 — All queries scoped by companyId from JWT payload
- Row Level Security (RLS) enforced at database level as secondary barrier
- No cross-tenant data leakage possible through API

## Input Validation

- VERIFY:FD-SEC-001 — Helmet middleware for security headers
- VERIFY:FD-SEC-002 — CORS configured with explicit origin whitelist
- VERIFY:FD-SEC-003 — Global ValidationPipe with whitelist: true, forbidNonWhitelisted: true
- class-validator decorators on all DTOs

## Rate Limiting

- ThrottlerGuard applied globally via APP_GUARD
- Prevents brute-force attacks on auth endpoints
- Configurable TTL and limit per endpoint

## Log Sanitization

- VERIFY:FD-SAN-001 — sanitizeLogContext strips password, token, authorization, ssn, creditCard
- VERIFY:FD-SAN-002 — Sanitizer handles nested objects and arrays
- Prevents sensitive data from appearing in log output

## Convention Gates

- Zero $executeRawUnsafe calls (prevents SQL injection)
- Zero dangerouslySetInnerHTML (prevents XSS)
- Zero || 'value' fallbacks for configuration (prevents insecure defaults)
- All findFirst calls have justification comments for Prisma query intent

## Integration Tests

- VERIFY:FD-TEST-005 — Security integration test covers:
  - Unauthenticated request returns 401
  - Invalid JWT returns 401
  - Tenant isolation prevents cross-company access
  - Rate limiting returns 429

## Performance Tests

- VERIFY:FD-TEST-006 — Performance integration test covers:
  - Response time under threshold
  - Concurrent request handling
  - Pagination performance with large datasets

## Cross-References

- See [Authentication](./authentication.md) for JWT guard configuration
- See [Monitoring](./monitoring.md) for security event logging
- See [Data Model](./data-model.md) for RLS policy definitions
- See [Infrastructure](./infrastructure.md) for production security configuration
