# Speakers Specification

## Overview

Speakers are individuals who present at event sessions. Each speaker has a
name, email, and bio. Speakers can be assigned to multiple sessions.
See [sessions.md](sessions.md) for session-speaker relationships.

## Module Structure

<!-- VERIFY:SPEAKER-MODULE -->
The `SpeakerModule` registers the speaker service and controller, importing
PrismaModule for database access. It is imported by AppModule.

<!-- VERIFY:SPEAKER-CONTROLLER -->
The `SpeakerController` maps HTTP methods to service operations:
- `POST /speakers` — Create speaker (EDITOR or ADMIN)
- `GET /speakers` — List speakers (paginated, tenant-scoped)
- `GET /speakers/:id` — Get speaker by ID
- `PATCH /speakers/:id` — Update speaker (EDITOR or ADMIN)
- `DELETE /speakers/:id` — Delete speaker (ADMIN only)

<!-- VERIFY:SPEAKER-SERVICE -->
The `SpeakerService` implements CRUD operations for speakers with organization
scoping. It supports pagination and includes session associations.

<!-- VERIFY:SPEAKER-DTO -->
Speaker DTOs define validation: name (required, max 200), email (required,
IsEmail), bio (optional string). class-validator decorators enforce.

<!-- VERIFY:SPEAKER-SERVICE-SPEC -->
Unit tests for SpeakerService validate CRUD operations, organization scoping,
pagination, and session association logic.

## Business Rules

- Name is required, max 200 characters
- Email is required, must be valid format
- Bio is optional
- Speakers can be assigned to multiple sessions
- All queries scoped by organizationId
- Only ADMIN can delete speakers

## Cross-References

- Sessions using speakers: see [sessions.md](sessions.md)
- Events containing sessions: see [events.md](events.md)
- Authentication: see [authentication.md](authentication.md)
