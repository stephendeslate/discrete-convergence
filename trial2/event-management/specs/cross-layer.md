# Cross-Layer Integration Specification

## Overview

This specification defines how all layers of the Event Management platform
integrate together, ensuring the global provider chain, shared package usage,
and cross-cutting concerns work cohesively.

## Global Provider Chain

<!-- VERIFY:EM-ARCH-001 — AppModule registers APP_GUARD, APP_FILTER, APP_INTERCEPTOR via DI -->
All global providers are registered in `AppModule` via NestJS dependency injection:

| Token | Provider | Purpose |
|-------|----------|---------|
| APP_GUARD | JwtAuthGuard | Global authentication |
| APP_GUARD | ThrottlerGuard | Global rate limiting |
| APP_FILTER | GlobalExceptionFilter | Centralized error handling |
| APP_INTERCEPTOR | ResponseTimeInterceptor | Response time tracking |

Domain controllers do NOT use `@UseGuards(JwtAuthGuard)` — they rely on the
global guard registered via `APP_GUARD`.

## Performance Integration

<!-- VERIFY:EM-PERF-001 — ResponseTimeInterceptor adds X-Response-Time header -->
`ResponseTimeInterceptor` measures request duration using `performance.now()`
from `perf_hooks` and sets `X-Response-Time` header on all responses.

<!-- VERIFY:EM-PERF-002 — Pagination clamping uses shared clampPagination -->
Pagination across all list endpoints uses `clampPagination()` from shared,
which enforces MAX_PAGE_SIZE (100) and DEFAULT_PAGE_SIZE (20).

## Event Lifecycle

<!-- VERIFY:EM-EVT-001 — Event service implements status machine transitions -->
The event service enforces a strict status machine with valid transitions:
- DRAFT -> PUBLISHED -> REGISTRATION_OPEN -> REGISTRATION_CLOSED -> IN_PROGRESS -> COMPLETED -> ARCHIVED
- CANCELLED allowed from any state except COMPLETED
- Invalid transitions return 400 Bad Request

## Registration Lifecycle

<!-- VERIFY:EM-REG-001 — Registration service manages registration lifecycle -->
Registration status management includes:
- PENDING -> CONFIRMED (auto-confirmed if capacity available)
- CONFIRMED -> CHECKED_IN (via check-in endpoint)
- Any active status -> CANCELLED
- Capacity enforcement at registration time

<!-- VERIFY:EM-REG-002 — Registration validates event is open before registering -->
Registration is only allowed when event status is REGISTRATION_OPEN or PUBLISHED.

## Shared Package Consumption

The shared package exports 8 utilities consumed by both apps:

| Export | Consumers |
|--------|-----------|
| BCRYPT_SALT_ROUNDS | auth.service.ts, seed.ts |
| ALLOWED_REGISTRATION_ROLES | register.dto.ts |
| APP_VERSION | monitoring.controller.ts, nav.tsx, settings/page.tsx |
| clampPagination | pagination.utils.ts |
| createCorrelationId | correlation-id.middleware.ts |
| formatLogEntry | request-logging.middleware.ts |
| sanitizeLogContext | global-exception.filter.ts |
| validateEnvVars | main.ts, actions.ts |

## Testing

<!-- VERIFY:EM-TEST-001 — Auth integration tests with supertest -->
<!-- VERIFY:EM-TEST-002 — Event integration tests with supertest -->
<!-- VERIFY:EM-TEST-003 — Cross-layer integration tests verifying full pipeline -->
<!-- VERIFY:EM-TEST-004 — Monitoring integration tests with supertest -->
<!-- VERIFY:EM-TEST-005 — Security integration tests with supertest -->
<!-- VERIFY:EM-TEST-006 — Performance integration tests with supertest -->
<!-- VERIFY:EM-TEST-007 — Event service unit tests with mocked Prisma -->
<!-- VERIFY:EM-TEST-008 — Registration service unit tests with mocked Prisma -->
<!-- VERIFY:EM-TEST-009 — Log sanitizer tests with array cases -->

## Accessibility

<!-- VERIFY:EM-AX-001 — Accessibility tests with jest-axe rendering real components -->
Accessibility testing uses `jest-axe` with real component rendering.

<!-- VERIFY:EM-AX-002 — Keyboard navigation tests with userEvent -->
Keyboard navigation tests use `@testing-library/user-event` for Tab, Enter, Space.

## Dark Mode

<!-- VERIFY:EM-UI-006 — Dark mode via @media (prefers-color-scheme: dark) -->
Dark mode is implemented via `@media (prefers-color-scheme: dark)` in globals.css,
not the `.dark` class approach.

## Cross-References

- See [authentication.md](authentication.md) for auth guard details
- See [monitoring.md](monitoring.md) for error handling and health endpoints
- See [security.md](security.md) for rate limiting and CSP
