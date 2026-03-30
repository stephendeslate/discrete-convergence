# Security Specification

> **Cross-references:** See [authentication.md](authentication.md), [api-endpoints.md](api-endpoints.md), [monitoring.md](monitoring.md), [infrastructure.md](infrastructure.md)

## Overview

Fleet Dispatch implements defense-in-depth security: Helmet CSP headers, CORS
configuration, rate limiting via ThrottlerModule, global validation pipe,
JWT authentication, and multi-tenant data isolation.

## HTTP Security Headers

### Helmet CSP
- VERIFY:FD-SEC-001 — Helmet CSP configuration
- Content-Security-Policy directives:
  - defaultSrc: 'self'
  - scriptSrc: 'self'
  - styleSrc: 'self', 'unsafe-inline'
  - imgSrc: 'self', data:
  - frameAncestors: 'none' (clickjacking prevention)
- Applied in main.ts bootstrap before app.listen()

## Rate Limiting

### ThrottlerModule
- VERIFY:FD-SEC-002 — ThrottlerModule with named configs (default + auth)
- Default rate: 100 requests per 60 seconds
- Auth rate: 5 requests per 60 seconds (brute-force prevention)
- ThrottlerGuard registered as APP_GUARD in AppModule
- @SkipThrottle() on health/metrics endpoints

## Authentication Guard

### JwtAuthGuard
- VERIFY:FD-SEC-003 — Global JwtAuthGuard with @Public() bypass for auth exemption
- Registered as APP_GUARD — applies to all routes by default
- Checks IS_PUBLIC_KEY metadata via Reflector
- @Public() decorated endpoints bypass authentication
- Returns 401 Unauthorized for missing/invalid JWT

## Input Validation

### ValidationPipe
- VERIFY:FD-SEC-004 — Global validation pipe with whitelist and forbidNonWhitelisted
- whitelist: true — strips unknown properties from request body
- forbidNonWhitelisted: true — throws 400 if unknown properties present
- transform: true — enables class-transformer for type coercion
- Applied globally in main.ts via app.useGlobalPipes()

## CORS

### Cross-Origin Configuration
- VERIFY:FD-SEC-005 — CORS configuration from environment
- origin: process.env.CORS_ORIGIN (configurable per environment)
- credentials: true (supports JWT in cookies)
- Allowed methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
- Allowed headers: Content-Type, Authorization, X-Correlation-ID

## Security Tests

### Integration Suite
- VERIFY:FD-SEC-006 — Security integration tests
- Tests verify Helmet CSP, CORS, rate limiting, validation pipe
- Multi-tenant isolation tested via companyId filtering
- See test/security.spec.ts

## Convention Gates (Zero Tolerance)

- Zero `as any` type assertions in source code
- Zero `console.log` in apps/api/src
- Zero `|| 'value'` fallback patterns (use ?? instead)
- Zero `$executeRawUnsafe` calls (use $executeRaw with Prisma.sql)
- Zero `dangerouslySetInnerHTML` in frontend components

## Cross-References

- Auth flow details: see auth.md (FD-AUTH-*)
- Global guard wiring: see cross-layer.md (FD-CL-001, FD-CL-003)
- Performance impact of rate limiting: see performance.md
