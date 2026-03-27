# Security Specification

## Overview
Authentication guards, input validation, rate limiting, CSP headers, RLS, and error handling.

### VERIFY: EM-SEC-001 — Global JWT auth guard via APP_GUARD
`JwtAuthGuard` is registered as `APP_GUARD` in `app.module.ts`. All routes require JWT unless decorated with `@Public()`.
The guard's `canActivate()` method checks for the `IS_PUBLIC_KEY` metadata using `Reflector`.
If the metadata is present, the request is allowed through without token validation.
Authentication is handled via JWT tokens as described in [authentication.md](authentication.md).
Implementation: `{ provide: APP_GUARD, useClass: JwtAuthGuard }` in the module providers array.

### VERIFY: EM-SEC-002 — ValidationPipe with whitelist, forbidNonWhitelisted, transform
Global `ValidationPipe` strips unknown properties (whitelist), rejects non-whitelisted fields (forbidNonWhitelisted), and auto-transforms payloads (transform). All string DTO fields have `@MaxLength` decorators. UUID fields use `@MaxLength(36)`.
The `whitelist` option silently strips properties not defined in the DTO class.
The `forbidNonWhitelisted` option returns a 400 error if extra properties are sent.
The `transform` option automatically converts query string parameters to their declared types.
This prevents mass-assignment vulnerabilities and type confusion attacks.

### VERIFY: EM-SEC-003 — CORS enabled on application
`app.enableCors()` is called in `main.ts` to allow cross-origin requests.
In production, CORS should be configured with specific allowed origins rather than the default wildcard.
CORS headers include Access-Control-Allow-Origin, Access-Control-Allow-Methods, and Access-Control-Allow-Headers.
The default configuration allows all origins for development convenience.

### VERIFY: EM-SEC-004 — Helmet with CSP directives
Helmet middleware configured with `contentSecurityPolicy.directives`: defaultSrc `['self']`, scriptSrc `['self']`, objectSrc `['none']`.
Helmet also sets X-Content-Type-Options, X-Frame-Options, and other security headers automatically.
The CSP directives prevent loading of external scripts and embedding of the application in iframes.
The `objectSrc: ['none']` directive blocks Flash and other plugin-based content.

### VERIFY: EM-SEC-005 — Row-Level Security on all tenanted tables
Migration SQL includes `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`, `ALTER TABLE ... FORCE ROW LEVEL SECURITY`, and `CREATE POLICY` for users, events, venues, and audit_logs tables.
RLS policies use `current_setting('app.current_tenant_id', TRUE)` to filter rows by tenant.
The Prisma client sets this session variable before each query via `SET app.current_tenant_id = $1`.
FORCE ROW LEVEL SECURITY ensures policies apply even to table owners.
This provides defense-in-depth tenant isolation at the database level.
The Prisma middleware sets the tenant context variable before each query execution.
RLS policies are tested in integration tests to verify tenant data cannot leak across boundaries.

### VERIFY: EM-SEC-006 — Global exception filter prevents stack trace leakage
`GlobalExceptionFilter` registered as `APP_FILTER` catches all exceptions and returns safe error responses without stack traces.
In production (NODE_ENV=production), error details are limited to status code and a generic message.
Stack traces are logged server-side for debugging but never sent to the client.
The filter uses `sanitizeLogValue()` to redact sensitive data in server-side logs.
HttpException subtypes preserve their original status codes (400, 401, 403, 404, 409, etc.).

### VERIFY: EM-SEC-007 — ThrottlerModule with limit 20000
`ThrottlerModule.forRoot([{ ttl: 60000, limit: 20000 }])` and `ThrottlerGuard` as `APP_GUARD` for rate limiting.
The high limit (20000) accommodates load testing scenarios while still providing DDoS protection.
Individual endpoints like login have stricter limits via the `@Throttle` decorator.
Exceeding the rate limit returns HTTP 429 Too Many Requests with a Retry-After header.
Rate limit state is tracked in-memory per process instance.
The TTL and limit values are imported from the shared package constants for consistency.
The ThrottlerGuard uses the client IP address as the tracking key for rate limit state.
