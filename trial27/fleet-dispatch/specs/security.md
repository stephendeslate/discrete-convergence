# Security Specification

## Overview
Multi-layered security with JWT auth, rate limiting, validation, CSP, RLS, and error sanitization.

### VERIFY: FD-SEC-001 — Global APP_GUARD for JwtAuthGuard
JwtAuthGuard is registered as a global APP_GUARD in AppModule. All routes require JWT unless decorated with @Public().
The guard's `canActivate()` method checks for the `IS_PUBLIC_KEY` metadata using NestJS Reflector.
If the metadata is set to true, the request bypasses JWT validation entirely.
Authentication is handled via JWT tokens as described in [authentication.md](authentication.md).
Implementation: `{ provide: APP_GUARD, useClass: JwtAuthGuard }` in the AppModule providers array.

### VERIFY: FD-SEC-002 — ThrottlerModule with limit 20000
ThrottlerModule.forRoot([{ ttl: 60000, limit: 20000 }]) and ThrottlerGuard registered as global APP_GUARD. Login has additional @Throttle({ short: { ttl: 1000, limit: 10 } }).
The high global limit (20000 requests per 60 seconds) accommodates load testing and high-throughput scenarios.
Individual endpoints can override with stricter limits via the @Throttle decorator.
The ThrottlerGuard uses the client IP address for rate limit tracking.
Exceeding the limit returns HTTP 429 Too Many Requests with a Retry-After header.

### VERIFY: FD-SEC-003 — Row-Level Security on all tenanted tables
PostgreSQL RLS enabled and forced on users, vehicles, drivers, dispatch_jobs, maintenance_logs, and audit_logs. Policies use current_setting('app.current_tenant_id', TRUE).
RLS is enabled via `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` in the Prisma migration SQL.
`FORCE ROW LEVEL SECURITY` ensures policies apply even to the table owner role.
Policies use: `current_setting('app.current_tenant_id', TRUE) = tenant_id::text`.
The Prisma client middleware sets the session variable before each query: `SET app.current_tenant_id = $1`.
This provides database-level tenant isolation as a defense-in-depth measure.

### VERIFY: FD-SEC-004 — ValidationPipe with whitelist and forbidNonWhitelisted
Global ValidationPipe configured with whitelist: true, forbidNonWhitelisted: true, transform: true. All DTO string fields have @MaxLength validators. UUID fields use @MaxLength(36).
The `whitelist` option strips any properties not defined in the DTO class.
The `forbidNonWhitelisted` option returns 400 Bad Request if extra properties are present.
The `transform` option automatically converts types (e.g., query string numbers).
@MaxLength validators prevent oversized payloads from reaching the database layer.

### VERIFY: FD-SEC-005 — Helmet with Content Security Policy
Helmet configured with contentSecurityPolicy directives: defaultSrc ['self'], scriptSrc ['self'], objectSrc ['none'].
Helmet also automatically sets: X-Content-Type-Options: nosniff, X-Frame-Options, Strict-Transport-Security.
The CSP `defaultSrc: ['self']` prevents loading of any external resources by default.
The `objectSrc: ['none']` directive blocks Flash and other plugin-based content entirely.
These headers protect against XSS, clickjacking, and MIME-type confusion attacks.

### VERIFY: FD-SEC-006 — CORS enabled
app.enableCors() called in main.ts bootstrap.
CORS headers allow cross-origin requests from the frontend application.
In production, the origin should be restricted to specific allowed domains.
The default configuration allows all origins, methods, and headers for development convenience.
Preflight OPTIONS requests are handled automatically by the CORS middleware.
CORS is essential for the Next.js frontend to communicate with the API across different ports.

### VERIFY: FD-SEC-007 — GlobalExceptionFilter sanitizes errors
GlobalExceptionFilter registered as APP_FILTER. Logs full stack traces server-side but returns sanitized error responses to clients. Uses sanitizeLogValue() for sensitive fields.
Client responses include only: statusCode, message, timestamp, and path.
Stack traces are logged with the correlation ID for debugging (see [monitoring.md](monitoring.md)).
The filter catches both HttpExceptions and unexpected errors, handling each appropriately.
Unexpected errors return a generic 500 Internal Server Error to prevent information leakage.
