# Sessions Specification

## Overview

Sessions are time-bounded segments within an event, optionally assigned to a
speaker. Sessions enable agenda and schedule management for events.
See [events.md](events.md) for the parent event entity.

## Module Structure

<!-- VERIFY:SESSION-MODULE -->
The `SessionModule` registers the session service and controller, importing
PrismaModule for database access. It is imported by AppModule.

<!-- VERIFY:SESSION-CONTROLLER -->
The `SessionController` maps HTTP methods to service operations:
- `POST /sessions` — Create session (EDITOR or ADMIN)
- `GET /sessions` — List sessions (paginated, tenant-scoped)
- `GET /sessions/:id` — Get session by ID
- `PATCH /sessions/:id` — Update session (EDITOR or ADMIN)
- `DELETE /sessions/:id` — Delete session (ADMIN only)

<!-- VERIFY:SESSION-SERVICE -->
The `SessionService` implements CRUD operations for sessions with organization
scoping. It validates that the referenced event and optional speaker exist
within the same organization.

<!-- VERIFY:SESSION-DTO -->
Session DTOs define validation: title (required), startTime/endTime (ISO dates,
end > start), eventId (required UUID), speakerId (optional UUID).

## Test Coverage

<!-- VERIFY:SESSION-SERVICE-SPEC -->
Unit tests for SessionService cover creation with event validation, listing
with pagination, speaker assignment, and organization scoping.

## Business Rules

- Title is required
- Start time and end time are required, end must be after start
- eventId must reference an existing event in the same organization
- speakerId is optional but must exist in same organization if provided
- All queries scoped by organizationId
- Only ADMIN can delete sessions

## Cross-References

- Parent event: see [events.md](events.md)
- Speaker assignment: see [speakers.md](speakers.md)
- Authentication: see [authentication.md](authentication.md)
