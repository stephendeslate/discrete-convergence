# Specification Index

## Overview

This index catalogs all specifications and their VERIFY tags for the
Analytics Engine (AE) project.

Cross-reference: All specs are in the specs/ directory.
Cross-reference: VERIFY tags appear in both spec files and source code (.ts/.tsx).

## Spec Files

| File | Domain | Description |
|------|--------|-------------|
| [authentication.md](authentication.md) | AUTH | JWT auth, login, registration |
| [data-model.md](data-model.md) | DATA | Prisma schema, entities, pagination |
| [api-endpoints.md](api-endpoints.md) | API | REST endpoints, request/response |
| [frontend.md](frontend.md) | FI/A11Y | Next.js pages, server actions, accessibility |
| [infrastructure.md](infrastructure.md) | INFRA | Docker, CI/CD, environment |
| [security.md](security.md) | SEC | Guards, RLS, validation, headers |
| [monitoring.md](monitoring.md) | MON | Logging, tracing, metrics |

## VERIFY Tag Registry

### Authentication (AE-AUTH-*)
- AE-AUTH-001: Registration role restrictions
- AE-AUTH-002: Login DTO validation
- AE-AUTH-003: Registration DTO with role restriction
- AE-AUTH-004: JWT access token expiry ≤1h
- AE-AUTH-005: Password hashing with bcryptjs
- AE-AUTH-006: JWT strategy bearer token extraction
- AE-AUTH-007: Auth endpoints public with rate limiting
- AE-AUTH-008: Duplicate email returns 409
- AE-AUTH-009: Invalid refresh token returns 401
- AE-AUTH-010: Empty password rejected
- AE-AUTH-011: Malformed email rejected
- AE-AUTH-012: Expired access token returns 401

### Dashboard (AE-DASH-*)
- AE-DASH-001: Dashboard status transitions
- AE-DASH-002: Dashboards scoped to tenant
- AE-DASH-003: Only DRAFT dashboards can be published
- AE-DASH-004: Only PUBLISHED dashboards can be archived
- AE-DASH-005: Dashboard CRUD with tenant scoping

### Widget (AE-WIDGET-*)
- AE-WIDGET-001: Widget creation DTO validation
- AE-WIDGET-002: Widget count capped at 20/dashboard
- AE-WIDGET-003: 7 widget types supported
- AE-WIDGET-004: Widget endpoints nested under dashboards
- AE-WIDGET-005: Recharts integration

### Data Source (AE-DS-*)
- AE-DS-001: Data source DTO validation
- AE-DS-002: Data source count limited by tier
- AE-DS-003: sourceHash for idempotent sync
- AE-DS-004: Data source endpoints with tier limits

### Data (AE-DATA-*)
- AE-DATA-001: Pagination limits
- AE-DATA-002: Pagination DTO enforcement
- AE-DATA-003: Pagination utility clamping
- AE-DATA-004: Data preview and widget data
- AE-DATA-005: Page number defaults
- AE-DATA-006: Limit clamping to MAX_PAGE_SIZE
- AE-DATA-007: Empty result set handling

### Embed (AE-EMBED-*)
- AE-EMBED-001: Dashboard must be PUBLISHED for embed
- AE-EMBED-002: Embed config allowed origins
- AE-EMBED-003: SSE stream endpoint

### API Key (AE-APIKEY-*)
- AE-APIKEY-001: API keys hashed before storage
- AE-APIKEY-002: API key prefix stored

### Audit (AE-AUDIT-*)
- AE-AUDIT-001: Audit log records with tenant scoping

### Security (AE-SEC-*)
- AE-SEC-001: Bcrypt salt rounds
- AE-SEC-002: Log sanitization
- AE-SEC-003: Role-based access control guard
- AE-SEC-004: Global JWT auth guard
- AE-SEC-005: Global guards configuration
- AE-SEC-006: Throttler configuration
- AE-SEC-007: Helmet CSP frame-ancestors
- AE-SEC-008: ValidationPipe whitelist
- AE-SEC-009: Non-whitelisted properties rejected
- AE-SEC-010: RLS policies
- AE-SEC-011: RLS parameterized query
- AE-SEC-012: Unauthenticated request returns 401

### Monitoring (AE-MON-*)
- AE-MON-001: Correlation ID generation
- AE-MON-002: Structured logging
- AE-MON-003: Response time tracking
- AE-MON-004: Correlation ID middleware
- AE-MON-005: Metrics endpoint ADMIN only
- AE-MON-006: Metrics content
- AE-MON-007: Missing correlation ID generates UUID
- AE-MON-008: Response time header format
- AE-MON-009: Non-admin denied metrics

### Infrastructure (AE-INFRA-*)
- AE-INFRA-001: Env var validation
- AE-INFRA-002: Prisma lifecycle
- AE-INFRA-003: Health endpoint public
- AE-INFRA-004: Readiness endpoint
- AE-INFRA-005: Main.ts configuration
- AE-INFRA-006: Multi-stage Dockerfile
- AE-INFRA-007: Shared package in production stage
- AE-INFRA-008: Missing DATABASE_URL error
- AE-INFRA-009: Missing JWT_SECRET error
- AE-INFRA-010: Graceful shutdown

### Accessibility (AE-A11Y-*)
- AE-A11Y-001: Root layout lang and title
- AE-A11Y-002: Home page heading hierarchy
- AE-A11Y-003: Login page labels
- AE-A11Y-004: Register page labels
- AE-A11Y-005: Dashboard list heading hierarchy
- AE-A11Y-006: Form input labels
- AE-A11Y-007: Registration form labels
- AE-A11Y-008: Dashboard builder headings

### Functional Integration (AE-FI-*)
- AE-FI-001: Login cookie setting
- AE-FI-002: Registration cookie setting
- AE-FI-003: Protected action token forwarding
- AE-FI-004: Invalid credentials error display
- AE-FI-005: Empty dashboard list prompt
