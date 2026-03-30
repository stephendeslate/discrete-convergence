# Analytics Engine — Specification Index

> **Project:** Analytics Engine
> **Version:** 1.0.0
> **Last Updated:** 2026-03-24
> **Status:** All specs APPROVED

Canonical index of all specification documents for the Analytics Engine platform.
Each spec is identified by a unique ID and contains VERIFY tags that correspond
to TRACED tags in the implementation source code.

## Specification Registry

| ID | Title | File | Status | Priority | Summary |
|----|-------|------|--------|----------|---------|
| SPEC-001 | Authentication | [SPEC-001-authentication.md](SPEC-001-authentication.md) | APPROVED | P0 | JWT auth flow, bcrypt hashing, token refresh, session management |
| SPEC-002 | Dashboards | [SPEC-002-dashboards.md](SPEC-002-dashboards.md) | APPROVED | P0 | Dashboard CRUD with tenant isolation and status lifecycle |
| SPEC-003 | Data Sources | [SPEC-003-data-sources.md](SPEC-003-data-sources.md) | APPROVED | P0 | External data connection management and sync tracking |
| SPEC-004 | Widgets | [SPEC-004-widgets.md](SPEC-004-widgets.md) | APPROVED | P1 | Visualization components bound to dashboards |
| SPEC-005 | Monitoring | [SPEC-005-monitoring.md](SPEC-005-monitoring.md) | APPROVED | P1 | Health checks, metrics, structured logging, correlation IDs |
| SPEC-006 | Multi-Tenancy | [SPEC-006-multi-tenancy.md](SPEC-006-multi-tenancy.md) | APPROVED | P0 | Tenant isolation via application-level filtering and RLS |
| SPEC-007 | Audit Logging | [SPEC-007-audit-logging.md](SPEC-007-audit-logging.md) | APPROVED | P1 | Immutable action log for compliance and debugging |
| SPEC-008 | Security | [SPEC-008-security.md](SPEC-008-security.md) | APPROVED | P0 | RBAC, guards, rate limiting, input validation, Helmet |
| SPEC-009 | API Conventions | [SPEC-009-api-conventions.md](SPEC-009-api-conventions.md) | APPROVED | P1 | REST standards, pagination, error format, correlation headers |

## Categories

### Core Specs
- **SPEC-001** Authentication — Foundational auth flow required by all protected endpoints
- **SPEC-006** Multi-Tenancy — Tenant isolation underpins all domain operations
- **SPEC-008** Security — Cross-cutting security enforcement

### Domain Specs
- **SPEC-002** Dashboards — Primary analytics container entity
- **SPEC-003** Data Sources — External data integration layer
- **SPEC-004** Widgets — Visualization components within dashboards
- **SPEC-007** Audit Logging — Compliance and observability for domain actions

### Infrastructure Specs
- **SPEC-005** Monitoring — Operational health and metrics
- **SPEC-009** API Conventions — Standards and patterns across all endpoints

## Traceability Convention

Every specification contains VERIFY tags in HTML comments:
```
<!-- VERIFY: auth-login -->
```

These correspond to TRACED tags in source code:
```
// TRACED:AE-AUTH-001 — Description of what this code implements
```

This bidirectional linking ensures every spec requirement maps to implementation
and every implementation traces back to a spec.

## Cross-References

- SPEC-001 references SPEC-006 (tenant scoping in JWT payload)
- SPEC-001 references SPEC-008 (bcrypt rounds, password validation)
- SPEC-002 references SPEC-004 (dashboard contains widgets)
- SPEC-002 references SPEC-006 (tenant-scoped queries)
- SPEC-003 references SPEC-006 (tenant-scoped data sources)
- SPEC-004 references SPEC-002 (widget belongs to dashboard)
- SPEC-005 references SPEC-009 (correlation ID header convention)
- SPEC-006 references SPEC-008 (RLS policies in migration SQL)
- SPEC-007 references SPEC-006 (tenant-scoped audit entries)
- SPEC-008 references SPEC-001 (JWT guard integration)
- SPEC-009 references SPEC-005 (X-Correlation-ID and X-Response-Time headers)

## Module Overview

The Analytics Engine is a multi-tenant analytics platform comprising:

- **API** (NestJS): RESTful backend with JWT authentication, RBAC, tenant isolation
- **Web** (Next.js 15): Dashboard UI with server actions and route protection
- **Shared**: Common constants, utilities, and types consumed by both apps

## Domain Entities

| Entity | Description | Tenant-scoped |
|--------|-------------|---------------|
| Tenant | Organization container with tier and theme | Root |
| User | Authenticated user with role (ADMIN/USER/VIEWER) | Yes |
| Dashboard | Analytics dashboard with title, description, status | Yes |
| Widget | Visualization component (LINE, BAR, PIE, etc.) on a dashboard | Via Dashboard |
| DataSource | External data connection (POSTGRES, MYSQL, REST_API, CSV) | Yes |
| SyncRun | Data sync execution record with status tracking | Via DataSource |
| AuditLog | Immutable action log for compliance | Yes |

## Verification Status

All specs are in APPROVED status. Verification tags are embedded in both
spec documents and source code to maintain traceability as the codebase evolves.

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-03-24 | System | Initial specification creation |
| 2026-03-24 | System | Added SPEC-NNN format specs with cross-references and categories |
