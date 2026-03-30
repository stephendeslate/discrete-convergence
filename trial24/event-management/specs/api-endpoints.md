# API Endpoints Specification

## Overview

The Event Management API exposes REST endpoints via NestJS controllers.
All endpoints except health checks and auth require JWT authentication.
Responses include correlation IDs and response time headers.

## Endpoint Summary

### Authentication (no auth required for register/login)
- `POST /auth/register` — Register new user (default VIEWER role)
- `POST /auth/login` — Login, returns access + refresh tokens
- `POST /auth/refresh` — Refresh access token (requires JWT)
- `GET /auth/me` — Get current user profile (requires JWT)

### Events
- `POST /events` — Create event (EDITOR+)
- `GET /events` — List events (paginated, tenant-scoped)
- `GET /events/:id` — Get event by ID
- `PATCH /events/:id` — Update event (EDITOR+)
- `DELETE /events/:id` — Delete event (ADMIN only)

### Venues
- `POST /venues` — Create venue (EDITOR+)
- `GET /venues` — List venues (paginated, tenant-scoped)
- `GET /venues/:id` — Get venue by ID
- `PATCH /venues/:id` — Update venue (EDITOR+)
- `DELETE /venues/:id` — Delete venue (ADMIN only)

### Sessions
- `POST /sessions` — Create session (EDITOR+)
- `GET /sessions` — List sessions (paginated, tenant-scoped)
- `GET /sessions/:id` — Get session by ID
- `PATCH /sessions/:id` — Update session (EDITOR+)
- `DELETE /sessions/:id` — Delete session (ADMIN only)

### Speakers
- `POST /speakers` — Create speaker (EDITOR+)
- `GET /speakers` — List speakers (paginated, tenant-scoped)
- `GET /speakers/:id` — Get speaker by ID
- `PATCH /speakers/:id` — Update speaker (EDITOR+)
- `DELETE /speakers/:id` — Delete speaker (ADMIN only)

### Tickets
- `POST /tickets` — Create ticket (EDITOR+)
- `GET /tickets` — List tickets (paginated, tenant-scoped)
- `GET /tickets/:id` — Get ticket by ID
- `PATCH /tickets/:id` — Update ticket (EDITOR+)
- `DELETE /tickets/:id` — Delete ticket (ADMIN only)

### Attendees
- `POST /attendees` — Register attendee (EDITOR+)
- `GET /attendees` — List attendees (paginated, tenant-scoped)
- `GET /attendees/:id` — Get attendee by ID
- `DELETE /attendees/:id` — Remove attendee (ADMIN only)

### Monitoring (no auth required)
- `GET /health` — Liveness probe
- `GET /health/ready` — Readiness probe with DB check

## Request/Response Conventions

- All list endpoints support `page` and `pageSize` query parameters
- UUID path parameters validated via ParseUUIDPipe
- Error responses: { statusCode, message, error, timestamp, correlationId }
- Paginated responses: { data, meta: { page, pageSize, total } }

## Cross-References

- Authentication details: see [authentication.md](authentication.md)
- Event endpoints: see [events.md](events.md)
- Venue endpoints: see [venues.md](venues.md)
- Session endpoints: see [sessions.md](sessions.md)
- Health endpoints: see [monitoring.md](monitoring.md)
