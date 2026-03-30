# Event Management — Specification Index

## Overview

Multi-tenant event management platform built with NestJS (API), Next.js 15 (Web), PostgreSQL (database), and Prisma (ORM). Supports JWT authentication, role-based access control, and row-level security for tenant isolation.

## API Endpoints Summary

| Method | Path | Auth | Description | Spec Reference |
|--------|------|------|-------------|----------------|
| POST | /auth/register | No | Register new user | See [authentication.md](authentication.md) |
| POST | /auth/login | No | User login | See [authentication.md](authentication.md) |
| POST | /auth/refresh | Yes | Refresh JWT tokens | See [authentication.md](authentication.md) |
| GET | /events | Yes | List events (paginated) | See [events.md](events.md) |
| POST | /events | Yes | Create event | See [events.md](events.md) |
| GET | /events/:id | Yes | Get event by ID | See [events.md](events.md) |
| PUT | /events/:id | Yes | Update event | See [events.md](events.md) |
| DELETE | /events/:id | Yes | Delete event | See [events.md](events.md) |
| PATCH | /events/:id/publish | Yes | Publish event | See [events.md](events.md) |
| PATCH | /events/:id/cancel | Yes | Cancel event | See [events.md](events.md) |
| GET | /venues | Yes | List venues (paginated) | See [venues.md](venues.md) |
| POST | /venues | Yes | Create venue | See [venues.md](venues.md) |
| GET | /venues/:id | Yes | Get venue by ID | See [venues.md](venues.md) |
| PUT | /venues/:id | Yes | Update venue | See [venues.md](venues.md) |
| DELETE | /venues/:id | Yes | Delete venue | See [venues.md](venues.md) |
| GET | /tickets | Yes | List tickets (paginated) | See [tickets.md](tickets.md) |
| POST | /tickets | Yes | Create ticket | See [tickets.md](tickets.md) |
| GET | /tickets/:id | Yes | Get ticket by ID | See [tickets.md](tickets.md) |
| PATCH | /tickets/:id/cancel | Yes | Cancel ticket | See [tickets.md](tickets.md) |
| PATCH | /tickets/:id/refund | Yes | Refund ticket | See [tickets.md](tickets.md) |
| GET | /attendees | Yes | List attendees (paginated) | See [attendees.md](attendees.md) |
| POST | /attendees | Yes | Register attendee | See [attendees.md](attendees.md) |
| GET | /attendees/:id | Yes | Get attendee by ID | See [attendees.md](attendees.md) |
| PATCH | /attendees/:id/check-in | Yes | Check in attendee | See [attendees.md](attendees.md) |
| GET | /speakers | Yes | List speakers (paginated) | See [speakers.md](speakers.md) |
| POST | /speakers | Yes | Create speaker | See [speakers.md](speakers.md) |
| GET | /speakers/:id | Yes | Get speaker by ID | See [speakers.md](speakers.md) |
| PUT | /speakers/:id | Yes | Update speaker | See [speakers.md](speakers.md) |
| DELETE | /speakers/:id | Yes | Delete speaker | See [speakers.md](speakers.md) |
| GET | /sessions | Yes | List sessions (paginated) | See [sessions.md](sessions.md) |
| POST | /sessions | Yes | Create session | See [sessions.md](sessions.md) |
| GET | /sessions/:id | Yes | Get session by ID | See [sessions.md](sessions.md) |
| PUT | /sessions/:id | Yes | Update session | See [sessions.md](sessions.md) |
| DELETE | /sessions/:id | Yes | Delete session | See [sessions.md](sessions.md) |
| PATCH | /sessions/:id/confirm | Yes | Confirm session | See [sessions.md](sessions.md) |
| GET | /sponsors | Yes | List sponsors (paginated) | See [events.md](events.md) |
| POST | /sponsors | Yes | Create sponsor | See [events.md](events.md) |
| GET | /sponsors/:id | Yes | Get sponsor by ID | See [events.md](events.md) |
| PUT | /sponsors/:id | Yes | Update sponsor | See [events.md](events.md) |
| DELETE | /sponsors/:id | Yes | Delete sponsor | See [events.md](events.md) |
| GET | /health | No | Health check | See [monitoring.md](monitoring.md) |
| GET | /health/ready | No | Readiness check | See [monitoring.md](monitoring.md) |
| GET | /health/metrics | No | Application metrics | See [monitoring.md](monitoring.md) |

## Specification Documents

- [authentication.md](authentication.md) — Authentication and authorization
- [data-model.md](data-model.md) — Data model and schema design
- [api-endpoints.md](api-endpoints.md) — API endpoint specifications
- [frontend.md](frontend.md) — Frontend application specifications
- [infrastructure.md](infrastructure.md) — Infrastructure and deployment
- [security.md](security.md) — Security requirements
- [monitoring.md](monitoring.md) — Monitoring and observability
- [events.md](events.md) — Event management domain
- [venues.md](venues.md) — Venue management domain
- [tickets.md](tickets.md) — Ticket management domain
- [attendees.md](attendees.md) — Attendee management domain
- [speakers.md](speakers.md) — Speaker management domain
- [sessions.md](sessions.md) — Session management domain

## Domain Model

```
User (id, email, passwordHash, role, tenantId)
Event (id, title, description, slug, status, startDate, endDate, capacity, tenantId, venueId)
Venue (id, name, address, city, capacity, tenantId)
Ticket (id, eventId, attendeeId, type, price, status, tenantId)
Attendee (id, name, email, phone, eventId, tenantId, checkedIn, checkedInAt)
Speaker (id, name, bio, email, tenantId)
Session (id, title, description, startTime, endTime, eventId, speakerId, tenantId, status)
Sponsor (id, name, tier, amount, eventId, tenantId)
AuditLog (id, action, entity, entityId, details, userId, tenantId)
```

## Cross-Cutting Concerns

- **Multi-tenancy**: All queries scoped to tenant_id via RLS and application-level filtering
- **Authentication**: JWT access tokens (15m) + refresh tokens (7d), bcryptjs with 12 salt rounds
- **Authorization**: Role-based (ADMIN, ORGANIZER, VIEWER)
- **Pagination**: Default page size 20, max 100
- **Validation**: class-validator decorators on all DTOs
- **Error handling**: Global exception filter with correlation IDs
- **Monitoring**: /health, /health/ready, /health/metrics endpoints

## Verification Tags
All VERIFY tags use prefix `EM-` and are tracked across spec and test files.
Minimum 35 VERIFY tags across all specifications.
