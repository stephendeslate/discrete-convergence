# Fleet Dispatch — Specification Index

## Overview

FleetDispatch is a multi-tenant field service dispatch platform enabling companies
to manage technicians, work orders, routes, GPS tracking, invoicing, and customer
communication in real-time.

## Technology Stack

| Layer         | Technology                          |
|---------------|-------------------------------------|
| Monorepo      | Turborepo 2 + pnpm workspaces      |
| API           | NestJS 11 (Node 20)                |
| Frontend      | Next.js 15 (App Router)            |
| Database      | PostgreSQL 16 + Prisma 6           |
| Real-time     | WebSocket (socket.io)              |
| Maps          | Leaflet + OpenStreetMap             |
| Auth          | JWT (access + refresh tokens)       |
| Shared        | packages/shared (10+ utilities)     |

## Specification Documents

| # | Document                                      | Description                                    |
|---|-----------------------------------------------|------------------------------------------------|
| 1 | [Authentication](./authentication.md)         | JWT auth, registration, guards, decorators     |
| 2 | [Data Model](./data-model.md)                 | Prisma schema, 14 models, 8 enums, RLS        |
| 3 | [API Endpoints](./api-endpoints.md)           | REST + WebSocket endpoints, state machines     |
| 4 | [Frontend](./frontend.md)                     | Next.js pages, components, dark mode, a11y     |
| 5 | [Security](./security.md)                     | Tenant isolation, input validation, CORS       |
| 6 | [Infrastructure](./infrastructure.md)         | Docker, CI/CD, migrations, environment         |
| 7 | [Monitoring](./monitoring.md)                 | Logging, correlation IDs, metrics, health      |

## Cross-References

- Authentication → Data Model: User/Company models define auth entities
- Authentication → API Endpoints: Guards protect all non-@Public routes
- Data Model → Security: RLS policies enforce tenant isolation at DB level
- API Endpoints → Monitoring: All requests get correlation IDs and response time tracking
- Frontend → API Endpoints: Server actions call API via fetch
- Security → Monitoring: Failed auth attempts are logged with sanitized context
- Infrastructure → Data Model: Migrations include RLS policy creation
- Monitoring → Security: Log sanitizer strips sensitive fields (password, token, ssn)

## Scoring Dimensions

| Dimension              | Primary Spec(s)            |
|------------------------|----------------------------|
| Schema correctness     | data-model.md              |
| Migration safety       | infrastructure.md          |
| Seed completeness      | data-model.md              |
| Auth implementation    | authentication.md          |
| API correctness        | api-endpoints.md           |
| Frontend quality       | frontend.md                |
| Security posture       | security.md                |
| Test coverage          | api-endpoints.md, frontend |
| Monitoring/observability | monitoring.md            |
| Convention compliance  | all specs                  |
| Traceability           | all specs (VERIFY tags)    |
| Infrastructure         | infrastructure.md          |

## VERIFY Tag Prefixes

All traceability tags use the `FD-` prefix:
- FD-SCHEMA-*: Data model specifications
- FD-MIG-*: Migration specifications
- FD-SEED-*: Seed data specifications
- FD-AUTH-*: Authentication specifications
- FD-DTO-*: Data transfer object specifications
- FD-GUARD-*: Guard specifications
- FD-WO-*: Work order specifications
- FD-GPS-*: GPS tracking specifications
- FD-INV-*: Invoice specifications
- FD-ROUTE-*: Route specifications
- FD-TRACK-*: Tracking token specifications
- FD-TECH-*: Technician specifications
- FD-CUST-*: Customer specifications
- FD-DISPATCH-*: Dispatch specifications
- FD-NOTIF-*: Notification specifications
- FD-PHOTO-*: Photo specifications
- FD-FE-*: Frontend specifications
- FD-SEC-*: Security specifications
- FD-MON-*: Monitoring specifications
- FD-PERF-*: Performance specifications
- FD-TEST-*: Test specifications
- FD-ENV-*: Environment specifications
- FD-CONST-*: Constants specifications
- FD-CORR-*: Correlation ID specifications
- FD-LOG-*: Logging specifications
- FD-SAN-*: Sanitizer specifications
- FD-FILTER-*: Filter specifications
- FD-SHARED-*: Shared package specifications
- FD-MAIN-*: Main entry point specifications
- FD-APP-*: App module specifications
