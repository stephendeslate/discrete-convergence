# Attendees Specification

## Overview

Attendees represent individuals registered for an event via a ticket. Each
attendee record links a person to a ticket and event within the organization.
See [tickets.md](tickets.md) for ticket types and pricing.

## Module Structure

<!-- VERIFY:ATTENDEE-MODULE -->
The `AttendeeModule` registers the attendee service and controller, importing
PrismaModule for database access. It is imported by AppModule.

<!-- VERIFY:ATTENDEE-CONTROLLER -->
The `AttendeeController` maps HTTP methods to service operations:
- `POST /attendees` — Register attendee (EDITOR or ADMIN)
- `GET /attendees` — List attendees (paginated, tenant-scoped)
- `GET /attendees/:id` — Get attendee by ID
- `DELETE /attendees/:id` — Remove attendee (ADMIN only)

<!-- VERIFY:ATTENDEE-SERVICE -->
The `AttendeeService` implements CRUD operations for attendees with organization
scoping. It validates that referenced tickets and events exist within the
same organization.

<!-- VERIFY:ATTENDEE-DTO -->
Attendee DTOs define validation: name (required, max 200), email (required,
IsEmail), ticketId (required UUID), eventId (required UUID).

<!-- VERIFY:ATTENDEE-SERVICE-SPEC -->
The `AttendeeService` unit tests validate CRUD logic, organization scoping,
and referenced entity validation.

## Business Rules

- Name is required, max 200 characters
- Email is required, valid format
- ticketId must reference a valid ticket in the same organization
- eventId must reference a valid event in the same organization
- All queries scoped by organizationId
- Only ADMIN can delete attendees

## Cross-References

- Tickets for attendees: see [tickets.md](tickets.md)
- Events for attendees: see [events.md](events.md)
- Authentication: see [authentication.md](authentication.md)
