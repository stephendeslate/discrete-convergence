# Tickets Specification

## Overview

Tickets define the types and pricing for event attendance. Each ticket type has
a price (decimal), quantity limit (integer), and is linked to a specific event.
See [events.md](events.md) for the parent event entity.

## Module Structure

<!-- VERIFY:TICKET-MODULE -->
The `TicketModule` registers the ticket service and controller, importing
PrismaModule for database access. It is imported by AppModule.

<!-- VERIFY:TICKET-CONTROLLER -->
The `TicketController` maps HTTP methods to service operations:
- `POST /tickets` — Create ticket (EDITOR or ADMIN)
- `GET /tickets` — List tickets (paginated, tenant-scoped)
- `GET /tickets/:id` — Get ticket by ID
- `PATCH /tickets/:id` — Update ticket (EDITOR or ADMIN)
- `DELETE /tickets/:id` — Delete ticket (ADMIN only)

<!-- VERIFY:TICKET-SERVICE -->
The `TicketService` implements CRUD operations for tickets with organization
scoping. It validates that the referenced event exists within the same
organization and enforces price/quantity constraints.

<!-- VERIFY:TICKET-DTO -->
Ticket DTOs define validation: type (required string), price (required,
non-negative decimal), quantity (required, positive integer), eventId
(required UUID). class-validator decorators enforce constraints.

<!-- VERIFY:TICKET-SERVICE-SPEC -->
Unit tests for TicketService validate CRUD operations, price/quantity
constraints, organization scoping, and event reference validation.

## Business Rules

- Type is required, non-empty string
- Price must be a non-negative decimal value
- Quantity must be a positive integer
- eventId must reference an existing event in the same organization
- All queries scoped by organizationId
- Only ADMIN can delete tickets

## Cross-References

- Parent event: see [events.md](events.md)
- Attendee registration via tickets: see [attendees.md](attendees.md)
- Data model: see [data-model.md](data-model.md)
