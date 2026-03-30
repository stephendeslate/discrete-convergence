# Cross-Layer Integration Specification

## Overview

This specification covers requirements that span multiple layers of the Analytics Engine:
cross-layer integration, frontend integration, performance optimization, and accessibility.

See also: [API Endpoints](api-endpoints.md) for individual endpoint contracts.
See also: [Frontend](frontend.md) for UI component details.
See also: [Monitoring](monitoring.md) for observability details.
See also: [Security](security.md) for auth guard and validation details.

## Cross-Layer Integration

- VERIFY: AE-CROSS-001 — Shared package exports constants consumed by both API and web (BCRYPT_SALT_ROUNDS, MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE, APP_VERSION, ALLOWED_REGISTRATION_ROLES)
- VERIFY: AE-CROSS-002 — AppModule wires all modules together with global guards (ThrottlerGuard, JwtAuthGuard, RolesGuard), global filter (GlobalExceptionFilter), global interceptor (ResponseTimeInterceptor), and middleware (CorrelationId, RequestLogging)

## Frontend Integration

- VERIFY: AE-FI-001 — API_ROUTES constant defines all backend route paths as single-quoted strings matching controller prefixes (/dashboards, /widgets, /data-sources, /queries)
- VERIFY: AE-FI-002 — Server actions use httpOnly cookies for token storage; loginAction sets the cookie, getAuthHeaders reads it and redirects to /login if missing; all protected actions include Authorization: Bearer headers

## Performance

- VERIFY: AE-PERF-001 — MAX_PAGE_SIZE constant (100) prevents unbounded queries
- VERIFY: AE-PERF-002 — DEFAULT_PAGE_SIZE constant (20) provides sensible default pagination
- VERIFY: AE-PERF-003 — clampPageSize, clampPage, calculateSkip utilities enforce pagination bounds
- VERIFY: AE-PERF-004 — ResponseTimeInterceptor measures request duration with performance.now() and sets X-Response-Time header
- VERIFY: AE-PERF-005 — buildPaginationParams utility uses clampPageSize/clampPage/calculateSkip from shared to normalize pagination input

## Accessibility

- VERIFY: AE-AX-001 — Loading states use role="status" and aria-busy="true" with Skeleton placeholders
- VERIFY: AE-AX-002 — Error boundaries use role="alert", useRef for focus management, and tabIndex={-1} for programmatic focus
- VERIFY: AE-AX-003 — Accessibility tests use jest-axe on real page components (no inline fixture components)
- VERIFY: AE-AX-004 — Keyboard navigation tests use userEvent for tab order and enter key activation on real page components
