# Event Management — Specification Index

## Overview

This index catalogs all specification documents for the Event Management platform.
The platform is a multi-tenant event management system built with NestJS 11,
Prisma 6, Next.js 15, and React 19. It supports event creation, scheduling,
attendee registration, ticketing, and check-in workflows.

Trial 4 of the discrete-convergence experiment. Tag prefix: EM-

## Specification Documents

| # | Document | Description | VERIFY Tags |
|---|----------|-------------|-------------|
| 1 | [authentication.md](authentication.md) | JWT auth, bcrypt, role-based access | EM-AUTH-* |
| 2 | [data-model.md](data-model.md) | Prisma schema, indexes, RLS, enums | EM-DATA-* |
| 3 | [api-endpoints.md](api-endpoints.md) | REST endpoints, DTOs, validation | EM-API-* |
| 4 | [frontend.md](frontend.md) | Next.js pages, components, a11y | EM-UI-*, EM-FE-*, EM-AX-* |
| 5 | [infrastructure.md](infrastructure.md) | Docker, CI/CD, seed, env validation | EM-INFRA-* |
| 6 | [security.md](security.md) | Helmet, CORS, throttling, validation | EM-SEC-* |
| 7 | [monitoring.md](monitoring.md) | Health, metrics, logging, correlation | EM-MON-* |
| 8 | [cross-layer.md](cross-layer.md) | Integration, shared, conventions | EM-CROSS-*, EM-PERF-*, EM-TEST-* |

## Tag Conventions

- **VERIFY tags** appear ONLY in `specs/*.md` files
- **TRACED tags** appear ONLY in `.ts`/`.tsx` source files
- Every VERIFY tag must have exactly one matching TRACED tag
- Every TRACED tag must reference an existing VERIFY tag
- Tag format: `VERIFY:EM-{CATEGORY}-{NNN}` / `TRACED:EM-{CATEGORY}-{NNN}`

## Architecture Overview

The platform follows a layered monorepo architecture:
- `apps/api/` — NestJS 11 backend with Prisma 6 ORM
- `apps/web/` — Next.js 15 frontend with React 19
- `packages/shared/` — Shared constants, utilities, and types

## Domain Model Summary

Core entities: Organization, User, Event, EventSession, Venue, TicketType,
Registration, CheckIn, WaitlistEntry, Notification, NotificationTemplate, AuditLog.

Event lifecycle: DRAFT → PUBLISHED → REGISTRATION_OPEN → IN_PROGRESS → COMPLETED
Registration lifecycle: PENDING → CONFIRMED → CHECKED_IN (or CANCELLED/WAITLISTED)

## Quality Gates

- Zero `as any` type assertions
- Zero `console.log` in production API code
- Zero `|| 'value'` env var fallbacks
- All `findFirst` calls justified with preceding comments
- 100% VERIFY↔TRACED bidirectional parity
