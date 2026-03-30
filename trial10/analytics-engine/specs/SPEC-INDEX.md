# Specification Index

## Overview

This document indexes all specifications for the Analytics Engine project.
Each specification covers a distinct domain of the system and contains
VERIFY tags in the format `AE-{DOMAIN}-{NNN}` that trace to TRACED tags
in the source code.

## Specification Files

| File | Domain | VERIFY Tags | Lines |
|------|--------|-------------|-------|
| [authentication.md](authentication.md) | Auth | AE-AUTH-001..009 | 9 |
| [data-model.md](data-model.md) | Data | AE-DATA-001..002 | 2 |
| [api-endpoints.md](api-endpoints.md) | API | AE-DASH/WIDGET/DS | 10 |
| [frontend.md](frontend.md) | UI | AE-UI/AX | 9 |
| [infrastructure.md](infrastructure.md) | Infra | AE-INFRA-001..002 | 2 |
| [security.md](security.md) | Security | AE-SEC-001..007 | 7 |
| [monitoring.md](monitoring.md) | Monitoring | AE-MON-001..009 | 9 |
| [cross-layer.md](cross-layer.md) | Integration | AE-CROSS/PERF/FI/AX | 10 |

Total VERIFY tags: 58 (minimum required: 35)

## Tag Domains

### AE-AUTH — Authentication
Covers JWT token flow, bcryptjs hashing, registration validation,
login flow, profile endpoint, token expiration, and role assignment.
See [authentication.md](authentication.md).

### AE-DATA — Data Model
Covers Prisma schema design including field mappings, indexes,
enums, and Row Level Security policies with TEXT comparison.
See [data-model.md](data-model.md).

### AE-DASH — Dashboard Endpoints
Covers CRUD operations for dashboards including tenant scoping,
pagination, role-based access control, and cache headers.
See [api-endpoints.md](api-endpoints.md).

### AE-WIDGET — Widget Endpoints
Covers CRUD operations for widgets including tenant scoping,
pagination, and dashboard association.
See [api-endpoints.md](api-endpoints.md).

### AE-DS — Data Source Endpoints
Covers CRUD operations for data sources including tenant scoping,
pagination, and status management.
See [api-endpoints.md](api-endpoints.md).

### AE-UI — Frontend Components
Covers Next.js pages, shadcn/ui components, server actions,
cookie-based authentication, and route structure.
See [frontend.md](frontend.md).

### AE-AX — Accessibility
Covers ARIA attributes, keyboard navigation, focus management,
loading states, error boundaries, and jest-axe validation.
See [frontend.md](frontend.md) and [cross-layer.md](cross-layer.md).

### AE-SEC — Security
Covers global guard chain, input validation, error sanitization,
rate limiting, CORS configuration, helmet middleware, and CSP.
See [security.md](security.md).

### AE-MON — Monitoring
Covers health endpoints, readiness checks, metrics collection,
structured logging with Pino, correlation IDs, and log sanitization.
See [monitoring.md](monitoring.md).

### AE-INFRA — Infrastructure
Covers Dockerfile multi-stage build, docker-compose configuration,
CI/CD pipeline, and environment variable management.
See [infrastructure.md](infrastructure.md).

### AE-CROSS — Cross-Layer Integration
Covers global provider chain, integration test pipeline, and
shared package usage across applications.
See [cross-layer.md](cross-layer.md).

### AE-PERF — Performance
Covers response time tracking, pagination utilities, cache headers,
and performance integration tests.
See [cross-layer.md](cross-layer.md).

### AE-FI — Frontend Integration
Covers API route constants, login/register server actions with
cookie storage, and protected action authorization flow.
See [cross-layer.md](cross-layer.md).

## Traceability

Every VERIFY tag in spec files has a corresponding TRACED tag in
TypeScript source or test files. The traceability chain ensures
that specifications are implemented and tested.

Format: `VERIFY: AE-{DOMAIN}-{NNN}` in specs maps to
`TRACED: AE-{DOMAIN}-{NNN}` in source code.

Orphan tolerance: <= 2 (per Gate 4 of methodology v1.1-dc).
