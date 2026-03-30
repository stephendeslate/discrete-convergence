# Cross-Layer Integration Specification

> **Project:** Event Management
> **Category:** CROSS
> **Cross-references:** See [authentication.md](authentication.md), [monitoring.md](monitoring.md)

---

## Requirements

### VERIFY:EM-CROSS-001 — Provider Chain

AppModule registers global providers using NestJS DI `{ provide: ..., useClass: ... }`:
- `APP_GUARD` — ThrottlerGuard (rate limiting), JwtAuthGuard (authentication)
- `APP_FILTER` — GlobalExceptionFilter (error handling + sanitization)
- `APP_INTERCEPTOR` — ResponseTimeInterceptor (performance tracking)

All providers registered in AppModule, NOT in main.ts. Domain controllers do not use
`@UseGuards(JwtAuthGuard)` — the global guard chain handles all authentication. Public
routes use `@Public()` decorator to bypass auth.

### VERIFY:EM-CROSS-002 — Shared Package Exports

Shared package barrel (`src/index.ts`) exports exactly 8 symbols consumed by apps:
1. `BCRYPT_SALT_ROUNDS` — bcrypt cost factor (used by auth service + seed)
2. `ALLOWED_REGISTRATION_ROLES` — role whitelist excluding ADMIN (used by auth DTO)
3. `APP_VERSION` — application version string (used by health endpoint + frontend)
4. `clampPagination` — pagination helper (MAX_PAGE_SIZE/DEFAULT_PAGE_SIZE internal)
5. `createCorrelationId` — UUID-based correlation ID generator
6. `formatLogEntry` — structured log formatter
7. `sanitizeLogContext` — redacts sensitive fields from log context
8. `validateEnvVars` — environment variable validation with process.exit(1)

Zero dead exports — every export is consumed by at least one file outside shared.

### VERIFY:EM-CROSS-003 — Integration Test

Cross-layer integration test covers full pipeline using supertest with real NestJS
AppModule compilation:
- Register user → authenticate → create event → publish event → register attendee
- Validates auth flow, CRUD operations, status transitions, and error handling
- Verifies correlation IDs propagate through the full request lifecycle
- Tests error paths return sanitized responses with correlationId

### VERIFY:EM-CROSS-004 — Cross-App Imports

Both `apps/api` and `apps/web` import from `@event-management/shared` workspace package
(workspace:* protocol in package.json). API uses: BCRYPT_SALT_ROUNDS, ALLOWED_REGISTRATION_ROLES,
APP_VERSION, createCorrelationId, formatLogEntry, sanitizeLogContext, validateEnvVars,
clampPagination. Web uses: APP_VERSION. Each app has >= 3 files importing from shared.
See [infrastructure.md](infrastructure.md) for Dockerfile workspace COPY pattern.

### VERIFY:EM-TEST-001 — Shared Integration Test Setup

Shared test setup module (`apps/api/test/test-setup.ts`) reduces boilerplate across
integration tests by providing a common NestJS application bootstrap with ValidationPipe
and AppModule compilation via `Test.createTestingModule`.

---

## Verification Checklist

- [ ] APP_GUARD provides ThrottlerGuard and JwtAuthGuard in AppModule providers
- [ ] APP_FILTER provides GlobalExceptionFilter in AppModule providers
- [ ] APP_INTERCEPTOR provides ResponseTimeInterceptor in AppModule providers
- [ ] No domain controller uses `@UseGuards(JwtAuthGuard)` directly
- [ ] `@Public()` decorator applied to auth and health routes
- [ ] Shared package barrel exports exactly 8 symbols
- [ ] Every exported symbol has at least one consumer outside packages/shared
- [ ] Cross-layer integration test compiles real AppModule via `Test.createTestingModule`
