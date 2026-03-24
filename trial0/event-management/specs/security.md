# Security Specification

## Overview
Defense-in-depth security with CORS, helmet, rate limiting, input validation,
Row Level Security, and log sanitization.

## Transport Security
- VERIFY:EM-SEC-001 — CORS configured with CORS_ORIGIN environment variable
- VERIFY:EM-SEC-002 — Helmet middleware sets security headers (X-Frame-Options, CSP, etc.)
- VERIFY:EM-SEC-003 — ValidationPipe with whitelist strips unknown properties

## Rate Limiting
- VERIFY:EM-SEC-004 — ThrottlerGuard applied globally via APP_GUARD
- Default: 100 requests per 60 seconds per IP
- Cross-reference: [authentication.md](./authentication.md) — Guards registered in AppModule

## Input Validation
- All DTOs use class-validator decorators
- whitelist: true strips unknown fields (prevent mass assignment)
- transform: true enables implicit type conversion

## Row Level Security
- RLS enabled and forced on all tenant-scoped tables
- Policies use current_setting('app.tenant_id') for tenant isolation
- Cross-reference: [data-model.md](./data-model.md) — Migration applies RLS policies

## Log Sanitization
- VERIFY:EM-SAN-001 — sanitizeLogContext strips password, token, secret, authorization fields
- VERIFY:EM-SAN-002 — Sanitizer handles nested objects, arrays, case-insensitive matching

## Monitoring Integration
- VERIFY:EM-MON-001 — GlobalExceptionFilter catches all unhandled errors
- VERIFY:EM-MON-002 — Exception filter uses structured logging (no console.log)
- Cross-reference: [monitoring.md](./monitoring.md) — Structured log format

## Convention Gates
- Zero `as any` casts in entire codebase
- Zero `console.log` in api/src (use LoggerService)
- Zero `|| 'value'` fallback patterns (use ?? or explicit defaults)
- Zero `$executeRawUnsafe` calls
- Zero `dangerouslySetInnerHTML` in frontend

## Multi-Tenant Isolation
- Application-level: all service methods scope queries by tenantId from JWT payload
- Database-level: RLS policies use current_setting('app.tenant_id') to enforce isolation
- Cross-reference: [authentication.md](./authentication.md) — tenantId extracted from JWT in every request
- Cross-reference: [data-model.md](./data-model.md) — Composite indexes on [tenantId, ...] for query performance
- VERIFY:EM-SEC-005 — No service method queries data without tenant scoping

## Error Information Disclosure
- Authentication errors do not reveal whether email exists (generic "invalid credentials")
- Stack traces excluded from production error responses
- Cross-reference: [monitoring.md](./monitoring.md) — Full error details logged server-side only
- Correlation IDs returned to client for support reference without exposing internals

## Dependency Security
- pnpm audit runs in CI pipeline to detect known vulnerabilities
- Cross-reference: [infrastructure.md](./infrastructure.md) — CI audit job configuration
- Node.js 20 Alpine base image minimizes container attack surface

## Test Coverage
- VERIFY:EM-TEST-005 — Security integration test: unauthorized access, invalid tokens, CORS
- VERIFY:EM-TEST-006 — Performance test: response time assertions with supertest
