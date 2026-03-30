# Analytics Engine — Specification Index

## Overview

This document serves as the central index for all specifications governing the Analytics Engine platform. The Analytics Engine is a multi-tenant embeddable analytics platform enabling SaaS companies to configure data sources, build dashboards, and embed branded analytics.

## Project Scope

- Multi-tenant analytics platform with full data isolation via PostgreSQL RLS
- Data ingestion pipeline with REST API, PostgreSQL, CSV, and Webhook connectors
- Dashboard builder with widgets (charts, KPIs, tables)
- Embeddable analytics via iframe with white-label theming
- JWT-based authentication with bcryptjs password hashing

## Specification Documents

### Core Specifications

1. [Authentication](authentication.md) — JWT auth flow, registration, login, token management
2. [Data Model](data-model.md) — Prisma schema, entity relationships, multi-tenant architecture
3. [API Endpoints](api-endpoints.md) — Complete REST API reference with request/response schemas
4. [Frontend](frontend.md) — Next.js pages, components, server actions, forms
5. [Infrastructure](infrastructure.md) — Docker, CI/CD, deployment, health checks
6. [Security](security.md) — RLS, CORS, CSP, rate limiting, input validation
7. [Monitoring](monitoring.md) — Health endpoints, metrics, structured logging, correlation IDs
8. [Edge Cases](edge-cases.md) — Boundary conditions, error handling, validation edge cases

## Cross-References

- Authentication flow integrates with Security spec (See specs/security.md)
- Data model RLS policies referenced in Infrastructure spec (See specs/infrastructure.md)
- API endpoints validated per Security spec input validation rules
- Monitoring endpoints defined in API spec and Infrastructure spec

## Architecture Decisions

- **ORM**: Prisma 6 with PostgreSQL 16 for type-safe database access
- **Auth**: JWT with bcryptjs (pure JS, no native dependencies)
- **Frontend**: Next.js 15 App Router with server actions
- **Monorepo**: Turborepo with pnpm workspaces
- **Logging**: Pino structured JSON logging with correlation IDs
- **Rate Limiting**: NestJS ThrottlerModule with 20000 req/min default

## Dimension Coverage

| Dimension | Primary Spec | Secondary Spec |
|-----------|-------------|----------------|
| CD | security.md | monitoring.md |
| DA | data-model.md | security.md |
| SV | SPEC-INDEX.md | All specs |
| ST | All specs | — |
| CQ-S | infrastructure.md | — |
| SE-S | security.md | — |
| SE | security.md | infrastructure.md |
| TE | edge-cases.md | — |
| FI | frontend.md | api-endpoints.md |
| BV | infrastructure.md | — |
| DB | data-model.md | infrastructure.md |
| TX | edge-cases.md | — |
| TA-U | edge-cases.md | — |
| TA-I | edge-cases.md | api-endpoints.md |
| EC | edge-cases.md | — |
| II | infrastructure.md | — |
| PF-R | monitoring.md | infrastructure.md |
| PF-L | infrastructure.md | — |
| SE-R | security.md | — |
| UI | frontend.md | — |
| FC | api-endpoints.md | data-model.md |
| AX | frontend.md | — |
