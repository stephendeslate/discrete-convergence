# Event Management — Specification Index

## Overview

Multi-tenant event management platform enabling organizations to create and
manage events, venues, sessions, speakers, tickets, and attendees. Built as
a monorepo with Turborepo, NestJS API, Next.js frontend, and shared packages.

## Tenant Model

All data is scoped by `organizationId`. PostgreSQL Row-Level Security enforces
tenant isolation at the database layer using `app.organization_id` session variable.

## Specification Files

| # | File | Domain | Description |
|---|------|--------|-------------|
| 1 | [authentication.md](authentication.md) | Auth | JWT auth, bcryptjs, Passport strategy, token refresh |
| 2 | [data-model.md](data-model.md) | Data | Prisma schema, entities, shared package |
| 3 | [api-endpoints.md](api-endpoints.md) | API | REST endpoints, request/response conventions |
| 4 | [frontend.md](frontend.md) | Web | Next.js pages, components, server actions |
| 5 | [infrastructure.md](infrastructure.md) | Infra | Docker, CI, environment config, monorepo |
| 6 | [security.md](security.md) | Security | RLS, Helmet, rate limiting, tenant guard |
| 7 | [monitoring.md](monitoring.md) | Ops | Health checks, bootstrap, app module |
| 8 | [events.md](events.md) | Domain | Event CRUD with status lifecycle |
| 9 | [venues.md](venues.md) | Domain | Venue management with capacity |
| 10 | [sessions.md](sessions.md) | Domain | Session scheduling, event/speaker links |
| 11 | [speakers.md](speakers.md) | Domain | Speaker profiles and bios |
| 12 | [tickets.md](tickets.md) | Domain | Ticket types, pricing, quantity |
| 13 | [attendees.md](attendees.md) | Domain | Attendee registration via tickets |

## API Endpoints Summary

### Authentication
- `POST /auth/register` — Register new user (default VIEWER role)
- `POST /auth/login` — Login, returns access + refresh tokens
- `POST /auth/refresh` — Refresh access token
- `GET /auth/me` — Get current user profile

### Domain CRUD (all require auth, paginated, tenant-scoped)
- Events: POST/GET/GET/:id/PATCH/:id/DELETE/:id
- Venues: POST/GET/GET/:id/PATCH/:id/DELETE/:id
- Sessions: POST/GET/GET/:id/PATCH/:id/DELETE/:id
- Speakers: POST/GET/GET/:id/PATCH/:id/DELETE/:id
- Tickets: POST/GET/GET/:id/PATCH/:id/DELETE/:id
- Attendees: POST/GET/GET/:id/DELETE/:id

### Monitoring (no auth)
- `GET /health` — Liveness probe
- `GET /health/ready` — Readiness probe with DB check

## Cross-Cutting Concerns

- **Pagination**: All list endpoints use `page` and `pageSize` query params
- **Correlation ID**: Every request gets `x-correlation-id` header — see [security.md](security.md)
- **Structured Logging**: Pino with request context — see [monitoring.md](monitoring.md)
- **Rate Limiting**: ThrottlerModule with limit=20000 — see [security.md](security.md)
- **Input Validation**: class-validator on all DTOs
- **Error Handling**: Global exception filter with consistent error shape

## Technical Decisions

- **bcryptjs** over bcrypt for cross-platform compatibility (BCRYPT_SALT_ROUNDS=12)
- **JWT dual-token**: access (15m) + refresh (7d) for session management
- **organizationId** as tenant key (not tenantId)
- **PostgreSQL RLS** for tenant isolation at the database level
- **ESLint 9 flat config** (eslint.config.mjs)
