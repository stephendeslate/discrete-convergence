# Security Specification

## Overview

The Analytics Engine implements multiple layers of security including
authentication, authorization, rate limiting, input validation, and content security.

## Authentication

### VERIFY: AE-SEC-001 — JWT authentication
All protected routes are guarded by JwtAuthGuard registered as APP_GUARD.
Tokens are validated on every request. Invalid or expired tokens return 401.

### VERIFY: AE-SEC-002 — Password hashing
Passwords are hashed with bcryptjs using 12 salt rounds.
Plain text passwords are never stored, logged, or returned in API responses.

## Authorization

### VERIFY: AE-SEC-003 — Tenant isolation
Row-Level Security (RLS) ensures data isolation between tenants.
The tenant context is set via PrismaService.setTenantContext() on every request.

## Rate Limiting

### VERIFY: AE-SEC-004 — Rate limiting
ThrottlerGuard is registered as APP_GUARD with a limit of 20,000 requests per 60 seconds.
The login endpoint has a stricter limit of 10 requests per second.
Rate limit headers (X-RateLimit-*) are included in all responses.

## Input Validation

### VERIFY: AE-SEC-005 — Validation pipeline
ValidationPipe is configured globally with:
- whitelist: true (strips unknown properties)
- forbidNonWhitelisted: true (rejects unknown properties with 400)
- transform: true (auto-transforms types)

All DTOs use class-validator decorators including @MaxLength on string fields
and @MaxLength(36) on UUID fields.

## Content Security

### VERIFY: AE-SEC-006 — Helmet CSP
Helmet middleware is configured with Content Security Policy (CSP) directives:
- defaultSrc: 'self'
- scriptSrc: 'self'
- objectSrc: 'none'

## Error Handling

### VERIFY: AE-SEC-007 — Global exception filter
GlobalExceptionFilter is registered as APP_FILTER. It:
- Catches all unhandled exceptions
- Returns structured error responses
- Logs internal errors without leaking stack traces
- Never exposes sensitive data in error messages

## CORS

CORS is configured on the application allowing configured origins.
Access-Control-Allow-Origin headers are present in responses.

## Cross-References

- Authentication flow: See [authentication.md](authentication.md)
- API contracts: See [api-endpoints.md](api-endpoints.md)
- Infrastructure: See [infrastructure.md](infrastructure.md)
