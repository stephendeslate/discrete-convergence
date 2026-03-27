# Fleet Dispatch — Specification Index

## Overview

This document indexes all specifications for the Fleet Dispatch Platform, a multi-tenant fleet management system built with NestJS, Next.js, Prisma, and PostgreSQL.

## Architecture

- **Backend**: NestJS 11 + Prisma 6 + PostgreSQL 16 with Row-Level Security
- **Frontend**: Next.js 15 App Router + React 19 + Tailwind CSS 4 + shadcn/ui
- **Monorepo**: Turborepo 2 + pnpm workspaces

## Specification Documents

### [Authentication](authentication.md)
Covers JWT-based authentication, registration, login, token management, and access control.
- Cross-references: [security.md](security.md) (FD-SEC-001, FD-SEC-004), [edge-cases.md](edge-cases.md) (FD-EDGE-001, FD-EDGE-002, FD-EDGE-012)
- Entry IDs: FD-AUTH-001 through FD-AUTH-006

### [Data Model](data-model.md)
Defines the Prisma schema with 7 models, enums, relationships, and indexing strategy.
- Cross-references: [security.md](security.md) (FD-SEC-003), [api-endpoints.md](api-endpoints.md) (FD-API-001 through FD-API-009)
- Entry IDs: FD-DM-001 through FD-DM-008

### [API Endpoints](api-endpoints.md)
Documents all REST API endpoints including auth, vehicles, drivers, dispatch jobs, maintenance, audit log, and monitoring.
- Cross-references: [authentication.md](authentication.md) (FD-AUTH-001, FD-AUTH-002), [monitoring.md](monitoring.md) (FD-MON-001 through FD-MON-003)
- Entry IDs: FD-API-001 through FD-API-009

### [Frontend](frontend.md)
Specifies all pages, components, layouts, and client-side behavior for the Next.js web application.
- Cross-references: [api-endpoints.md](api-endpoints.md), [authentication.md](authentication.md) (FD-AUTH-001)
- Entry IDs: FD-FE-001 through FD-FE-011

### [Infrastructure](infrastructure.md)
Covers Docker, CI/CD, environment configuration, startup validation, and deployment concerns.
- Cross-references: [monitoring.md](monitoring.md) (FD-MON-001), [security.md](security.md) (FD-SEC-005, FD-SEC-006)
- Entry IDs: FD-INF-001 through FD-INF-010

### [Security](security.md)
Documents authentication guards, rate limiting, validation, CSP, RLS, error handling, and CORS.
- Cross-references: [authentication.md](authentication.md) (FD-AUTH-001 through FD-AUTH-003), [data-model.md](data-model.md) (FD-DM-001)
- Entry IDs: FD-SEC-001 through FD-SEC-007

### [Monitoring](monitoring.md)
Specifies health checks, readiness probes, metrics, correlation ID tracking, and logging.
- Cross-references: [infrastructure.md](infrastructure.md) (FD-INF-002), [api-endpoints.md](api-endpoints.md) (FD-API-009)
- Entry IDs: FD-MON-001 through FD-MON-006

### [Edge Cases](edge-cases.md)
Enumerates boundary conditions, error scenarios, and validation edge cases across all modules.
- Cross-references: All other specs
- Entry IDs: FD-EDGE-001 through FD-EDGE-019

## Traceability

All source code files contain `// TRACED: FD-XXX-NNN` comments linking to the relevant VERIFY entry in these specs.

## Naming Conventions

| Prefix    | Domain                    |
|-----------|---------------------------|
| FD-AUTH   | Authentication            |
| FD-DM     | Data Model                |
| FD-API    | API Endpoints             |
| FD-FE     | Frontend                  |
| FD-INF    | Infrastructure            |
| FD-SEC    | Security                  |
| FD-MON    | Monitoring                |
| FD-EDGE   | Edge Cases                |
