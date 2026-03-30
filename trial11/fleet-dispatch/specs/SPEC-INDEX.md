# Fleet Dispatch — Specification Index

## Project Overview

Fleet Dispatch is a multi-tenant fleet/vehicle dispatch management system built with NestJS, Next.js, Prisma, and PostgreSQL. It enables companies to manage vehicles, drivers, and dispatch assignments with real-time tracking of dispatch status.

## Domain Model

The system manages the following entities:
- **Tenants**: Multi-tenant isolation via tenant_id on all domain tables
- **Users**: Authentication with JWT + bcryptjs, role-based access (ADMIN, DISPATCHER, DRIVER)
- **Vehicles**: Fleet inventory with status tracking (AVAILABLE, IN_USE, MAINTENANCE, RETIRED)
- **Drivers**: Driver profiles linked to users with license and certification data
- **Dispatches**: Dispatch assignments linking vehicles to drivers with status workflow

## Specification Documents

### Core Specifications

1. [Authentication](authentication.md) — JWT auth, registration, login, RBAC with roles
2. [Data Model](data-model.md) — Prisma schema, entities, indexes, RLS policies
3. [API Endpoints](api-endpoints.md) — REST API controllers, CRUD operations, validation
4. [Frontend](frontend.md) — Next.js pages, server actions, shadcn/ui components
5. [Infrastructure](infrastructure.md) — Docker, CI/CD, migrations, seed data
6. [Security](security.md) — Helmet, CORS, rate limiting, validation, tenant isolation
7. [Monitoring](monitoring.md) — Logging, health checks, metrics, correlation IDs

### Integration Specifications

8. [Cross-Layer Integration](cross-layer.md) — Full pipeline verification, cumulative checks

## Spec Traceability

All specs use the `FD-{DOMAIN}-{NNN}` prefix format for VERIFY tags.
TRACED tags appear only in `.ts` and `.tsx` source files.

### Tag Prefix Guide

| Prefix | Domain | Spec File |
|--------|--------|-----------|
| FD-AUTH | Authentication | authentication.md |
| FD-DATA | Data Model | data-model.md |
| FD-API | API Endpoints | api-endpoints.md |
| FD-UI | Frontend | frontend.md |
| FD-INFRA | Infrastructure | infrastructure.md |
| FD-SEC | Security | security.md |
| FD-MON | Monitoring | monitoring.md |
| FD-PERF | Performance | api-endpoints.md, cross-layer.md |
| FD-CROSS | Cross-Layer | cross-layer.md |

## Cross-References

- Authentication spec references Security spec for RBAC guard chain
- Data Model spec references Security spec for RLS policies
- API Endpoints spec references Monitoring spec for correlation IDs
- Frontend spec references Authentication spec for token storage
- Infrastructure spec references Data Model spec for migrations
- Cross-Layer spec references all other specs for cumulative verification

## Quality Gates

All specs follow CED v1.2-dc methodology requirements:
- Each spec file >= 55 lines
- SPEC-INDEX >= 60 lines
- >= 35 VERIFY tags with bidirectional TRACED parity
- >= 2 specs with cross-references to other specs
- No template or placeholder VERIFY tags
