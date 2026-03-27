# Event Management Platform — Specification Index

## Overview
This document indexes all specifications for the Event Management Platform.
The platform is a multi-tenant event management system built with NestJS, Prisma, PostgreSQL, Next.js, and React.

## Specification Documents

### 1. Authentication (`authentication.md`)
Covers JWT-based authentication, registration, login, password hashing, and token management.
- Cross-references: EM-AUTH-001 through EM-AUTH-006
- Related: security.md (EM-SEC-001, EM-SEC-002)

### 2. Data Model (`data-model.md`)
Covers Prisma schema, database models, enums, indexes, and RLS configuration.
- Cross-references: EM-DATA-001 through EM-DATA-008
- Related: security.md (EM-SEC-005), edge-cases.md (EM-EDGE-005)

### 3. API Endpoints (`api-endpoints.md`)
Covers all REST API endpoints, request/response formats, and route configuration.
- Cross-references: EM-API-001 through EM-API-009
- Related: authentication.md (EM-AUTH-003, EM-AUTH-004)

### 4. Frontend (`frontend.md`)
Covers Next.js pages, React components, server actions, and UI patterns.
- Cross-references: EM-FE-001 through EM-FE-018
- Related: api-endpoints.md (EM-API-003 through EM-API-007)

### 5. Infrastructure (`infrastructure.md`)
Covers Docker, CI/CD, environment configuration, and deployment.
- Cross-references: EM-INFRA-001 through EM-INFRA-009
- Related: monitoring.md (EM-MON-001)

### 6. Security (`security.md`)
Covers authentication guards, validation, rate limiting, CSP, RLS, and error handling.
- Cross-references: EM-SEC-001 through EM-SEC-007
- Related: authentication.md (EM-AUTH-001), edge-cases.md (EM-EDGE-017)

### 7. Monitoring (`monitoring.md`)
Covers health checks, metrics, logging, and correlation IDs.
- Cross-references: EM-MON-001 through EM-MON-006
- Related: infrastructure.md (EM-INFRA-002), security.md (EM-SEC-006)

### 8. Edge Cases (`edge-cases.md`)
Covers error handling, validation edge cases, boundary conditions, and failure modes.
- Cross-references: EM-EDGE-001 through EM-EDGE-017
- Related: security.md (EM-SEC-002), api-endpoints.md (EM-API-003 through EM-API-006)

## Naming Convention
All VERIFY entries follow the format: `EM-{CATEGORY}-{NNN}`
- AUTH: Authentication
- DATA: Data Model
- API: API Endpoints
- FE: Frontend
- INFRA: Infrastructure
- SEC: Security
- MON: Monitoring
- EDGE: Edge Cases

## Architecture
- **Backend**: NestJS 11 + Prisma 6 + PostgreSQL 16
- **Frontend**: Next.js 15 + React 19 + Tailwind CSS 4 + shadcn/ui
- **Monorepo**: Turborepo 2 + pnpm workspaces
- **Packages**: apps/api, apps/web, packages/shared

## Key Decisions
- bcryptjs (not bcrypt) for password hashing with 12 salt rounds
- ThrottlerModule limit set to 20000 to support load testing
- ESLint 9 flat config (eslint.config.mjs)
- Health endpoint at /health (not /monitoring/health)
- Row-Level Security (RLS) for tenant isolation
- JWT authentication with 24h token expiry
