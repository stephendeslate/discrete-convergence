# Events Specification

## Overview

Events are the primary domain entity. Each event belongs to an organization,
has a status lifecycle (DRAFT -> PUBLISHED -> CANCELLED), and can be linked
to venues, sessions, speakers, tickets, and attendees.

## Module Structure

<!-- VERIFY:EVENT-MODULE -->
The `EventModule` registers the event service and controller, importing
PrismaModule for database access. It is imported by AppModule.

<!-- VERIFY:EVENT-CONTROLLER -->
The `EventController` maps HTTP methods to service operations:
- `POST /events` — Create event (EDITOR or ADMIN)
- `GET /events` — List events (paginated, tenant-scoped)
- `GET /events/:id` — Get event by ID
- `PATCH /events/:id` — Update event (EDITOR or ADMIN)
- `DELETE /events/:id` — Delete event (ADMIN only)

<!-- VERIFY:EVENT-SERVICE -->
The `EventService` implements CRUD operations for events with organization
scoping. It supports pagination, status filtering, and validates that
referenced venues exist within the same organization.

<!-- VERIFY:EVENT-DTO -->
Event DTOs define validation: title (required, max 200), description
(optional), startDate/endDate (ISO dates, end > start), status (enum),
venueId (optional UUID).

## Test Coverage

<!-- VERIFY:EVENT-SERVICE-SPEC -->
Unit tests for EventService cover creation with defaults, listing with
pagination, status transitions, organization scoping, and venue validation.

<!-- VERIFY:TEST-EVENT-INTEGRATION -->
Integration tests verify the full HTTP lifecycle for event CRUD including
authentication, authorization by role, and pagination behavior.

## Business Rules

- Status defaults to DRAFT on creation
- Status lifecycle: DRAFT -> PUBLISHED -> CANCELLED
- End date must be after start date
- Only ADMIN can delete events
- All queries scoped by organizationId

## Cross-References

- Sessions linked to events: see [sessions.md](sessions.md)
- Tickets linked to events: see [tickets.md](tickets.md)
- Attendees registered for events: see [attendees.md](attendees.md)
- Venues hosting events: see [venues.md](venues.md)
