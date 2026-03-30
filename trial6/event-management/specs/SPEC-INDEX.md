# Event Management Platform — Specification Index

## Overview

This document indexes all specifications for the Event Management platform,
a multi-tenant event management system built with NestJS, Prisma, Next.js,
and PostgreSQL. The platform supports event lifecycle management, ticketing
with Decimal pricing, attendee registration and check-in, venue management,
and comprehensive audit logging.

## Architecture

- **API**: NestJS 11 with Prisma ORM, PostgreSQL, JWT authentication
- **Web**: Next.js 15 with App Router, React 19, server actions, Tailwind 4
- **Shared**: TypeScript package for constants, utilities, types
- **Monorepo**: pnpm workspaces with Turborepo orchestration

## Specifications

| ID | Title | File | Status | Priority | Summary |
|----|-------|------|--------|----------|---------|
| SPEC-001 | Authentication | [SPEC-001-authentication.md](SPEC-001-authentication.md) | APPROVED | P0 | JWT-based auth with bcrypt hashing, role-restricted registration, cookie-based sessions |
| SPEC-002 | Events | [SPEC-002-events.md](SPEC-002-events.md) | APPROVED | P0 | Event CRUD with lifecycle states, tenant-scoped access, venue association |
| SPEC-003 | Tickets | [SPEC-003-tickets.md](SPEC-003-tickets.md) | APPROVED | P0 | Ticket management with Decimal pricing, event-scoped creation, inventory tracking |
| SPEC-004 | Attendees | [SPEC-004-attendees.md](SPEC-004-attendees.md) | APPROVED | P1 | Attendee registration, check-in status management, event and ticket validation |
| SPEC-005 | Venues | [SPEC-005-venues.md](SPEC-005-venues.md) | APPROVED | P1 | Venue CRUD with capacity tracking, tenant-scoped access |
| SPEC-006 | Multi-Tenancy | [SPEC-006-multi-tenancy.md](SPEC-006-multi-tenancy.md) | APPROVED | P0 | Tenant isolation at service layer, subscription tiers, RLS policies |
| SPEC-007 | Audit Logging | [SPEC-007-audit-logging.md](SPEC-007-audit-logging.md) | APPROVED | P1 | Immutable audit trail with admin-only read access, entity filtering |
| SPEC-008 | Security | [SPEC-008-security.md](SPEC-008-security.md) | APPROVED | P0 | RBAC guards, input validation, rate limiting, Helmet headers, RLS |
| SPEC-009 | API Conventions | [SPEC-009-api-conventions.md](SPEC-009-api-conventions.md) | APPROVED | P1 | Pagination, error responses, correlation IDs, structured logging |

## Legacy Specifications

| ID | Title | File | Status | Summary |
|----|-------|------|--------|---------|
| EM-API | API Endpoints | [api-endpoints.md](api-endpoints.md) | APPROVED | REST API design for all domain resources with CRUD operations |
| EM-AUTH | Authentication | [authentication.md](authentication.md) | APPROVED | JWT-based auth with bcrypt hashing, role-based registration |
| EM-DATA | Data Model | [data-model.md](data-model.md) | APPROVED | Prisma schema with multi-tenant models, Decimal prices |
| EM-FE | Frontend | [frontend.md](frontend.md) | APPROVED | Next.js 15 web app with server actions and shadcn/ui |

## Trace Tag Convention

Each specification defines VERIFY tags in the format `VERIFY:EM-{AREA}-{NUMBER}`.
Corresponding TRACED tags in source code link implementation to spec requirements.

- Spec tags: `VERIFY:EM-AUTH-001`, `VERIFY:EM-API-001`, etc.
- Source tags: `TRACED:EM-AUTH-001`, `TRACED:EM-API-001`, etc.

## Domain Context

The platform supports the following domain entities:

- **Tenants**: Multi-tenant isolation with subscription tiers (FREE, PRO, ENTERPRISE)
- **Users**: Role-based access control (ADMIN, ORGANIZER, VIEWER) scoped to tenants
- **Events**: Lifecycle management (DRAFT -> PUBLISHED -> COMPLETED/CANCELLED)
- **Venues**: Physical locations with capacity limits, tenant-scoped
- **Tickets**: Typed pricing (GENERAL, VIP, EARLY_BIRD) with Decimal amounts
- **Attendees**: Registration and check-in tracking (REGISTERED, CHECKED_IN, NO_SHOW)
- **Audit Logs**: Immutable record of system actions, admin-only access

## Quality Gates

- All endpoints require JWT authentication except health/monitoring (marked @Public)
- Tenant isolation enforced at service layer via tenantId from JWT payload
- Pagination clamped (not rejected) via shared clampPagination utility
- Structured JSON logging with Pino, correlation IDs on all requests
- No $executeRaw — use Prisma query builder (exception: health check SELECT 1)
- Decimal type for all monetary values (ticket prices)
- class-validator DTOs with whitelist + forbidNonWhitelisted
- No console.log — Pino logger only
- import type for type-only imports

## Test Coverage

- Unit tests for all services with real mocking patterns (no mock-returns-mock)
- Integration tests for auth flow, cross-layer behavior, CRUD operations
- Performance tests for pagination and response times
- Security tests for RBAC and input validation
- Web app component tests with jest-axe accessibility testing

## Cross-References

- API endpoint spec references authentication for guard details
- Multi-tenancy spec references security for RLS implementation
- All CRUD specs reference API conventions for pagination and error formats
- Frontend spec references authentication for cookie-based session flow
