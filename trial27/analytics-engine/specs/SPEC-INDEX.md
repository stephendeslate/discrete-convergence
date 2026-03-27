# Analytics Engine — Specification Index

## Overview

This document serves as the master index for all specifications in the Analytics Engine platform.
The Analytics Engine is a multi-tenant embeddable analytics platform that provides dashboard creation,
data source management, widget configuration, and data synchronization capabilities.

## Specification Documents

### Core Specifications

| Document | Description | Status |
|----------|------------|--------|
| [authentication.md](authentication.md) | JWT-based auth with registration, login, and token management | Complete |
| [data-model.md](data-model.md) | Prisma schema, entities, relationships, and RLS | Complete |
| [api-endpoints.md](api-endpoints.md) | REST API endpoint inventory and contracts | Complete |
| [frontend.md](frontend.md) | Next.js pages, components, server actions | Complete |
| [infrastructure.md](infrastructure.md) | Docker, CI/CD, health checks, deployment | Complete |
| [security.md](security.md) | Authentication, authorization, rate limiting, CSP | Complete |
| [monitoring.md](monitoring.md) | Health endpoints, metrics, logging, correlation IDs | Complete |
| [edge-cases.md](edge-cases.md) | Edge case scenarios and error handling | Complete |

## Architecture Summary

The Analytics Engine follows a monorepo architecture with:
- **apps/api**: NestJS 11 backend with Prisma 6 ORM
- **apps/web**: Next.js 15 frontend with App Router
- **packages/shared**: Shared types, constants, and utilities

## Multi-Tenancy

All data is tenant-scoped using PostgreSQL Row-Level Security (RLS).
Each request sets the tenant context via `SET LOCAL app.current_tenant_id`.

## Domain Entities

- **Tenant**: Organization with tier-based feature gating
- **User**: Authenticated user belonging to a tenant
- **Dashboard**: Container for widgets with DRAFT/PUBLISHED/ARCHIVED lifecycle
- **Widget**: Chart/KPI visualization bound to a data source
- **DataSource**: External data connection with sync capabilities
- **SyncRun**: Record of data synchronization attempts
- **AuditLog**: Immutable event log for compliance

## Cross-References

- Authentication flow details: See [authentication.md](authentication.md)
- Data model relationships: See [data-model.md](data-model.md)
- API contract details: See [api-endpoints.md](api-endpoints.md)
- Security policies: See [security.md](security.md)
- Edge case handling: See [edge-cases.md](edge-cases.md)

## Traceability

All specifications use VERIFY tags in the format `AE-{DOMAIN}-{NNN}`.
Implementation files contain matching TRACED tags for bidirectional traceability.

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-01-01 | Initial specification |
| 1.1 | 2024-03-01 | Added edge cases, monitoring specs |
| 1.2 | 2024-06-01 | Updated RLS policies, added sync history |
