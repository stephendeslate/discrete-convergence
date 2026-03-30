# Security Specification

## Overview

The Analytics Engine implements defense-in-depth security including JWT authentication, Row Level Security, rate limiting, CSP headers, and input validation.

## Authentication Security

- JWT tokens signed with secret from environment variable
- bcryptjs with 12 salt rounds (pure JS, no native deps)
- Login endpoint rate-limited to 10 requests/second
- No password exposed in API responses or logs

## Row Level Security (RLS)

All tenanted tables have RLS policies:
- ENABLE ROW LEVEL SECURITY on each table
- FORCE ROW LEVEL SECURITY
- CREATE POLICY using current_setting('app.current_tenant_id')

Tables with RLS: users, dashboards, widgets, data_sources, sync_history, audit_logs

## HTTP Security Headers

- Helmet middleware with Content Security Policy
- CSP directives: default-src 'self', script-src 'self', etc.
- CORS configured with explicit origin, credentials, methods, headers

## Rate Limiting

- ThrottlerModule with limit: 20000 (default)
- Login endpoint: short throttle (10 req/sec)
- ThrottlerGuard as APP_GUARD (applies globally)
- Rate limit headers included in responses

## Input Validation

- ValidationPipe with whitelist: true, forbidNonWhitelisted: true
- @MaxLength() on all string DTO fields
- @MaxLength(36) on UUID fields
- @IsEmail() on email fields

## Global Error Handling

- GlobalExceptionFilter as APP_FILTER
- Structured error responses with statusCode, message, timestamp, path
- Internal errors logged but not exposed to client

## Environment Validation

- Required env vars validated at startup (DATABASE_URL, JWT_SECRET)
- No hardcoded secrets in source code
- No $executeRawUnsafe usage

## Verification

<!-- VERIFY: AE-SEC-001 — Helmet CSP headers present in responses -->
<!-- VERIFY: AE-SEC-002 — Rate limiting active on all endpoints -->
<!-- VERIFY: AE-SEC-003 — Protected endpoints return 401 without token -->
<!-- VERIFY: AE-SEC-004 — Input validation rejects malformed requests -->
<!-- VERIFY: AE-SEC-005 — No hardcoded JWT secrets in source code -->
