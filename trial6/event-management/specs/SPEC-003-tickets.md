# SPEC-003: Tickets

**Status:** APPROVED
**Priority:** P0
**Cross-References:** SPEC-002 (Events), SPEC-004 (Attendees), SPEC-008 (Security)

## Overview

Ticket management with Decimal pricing, typed categories, event-scoped
creation with tenant ownership validation, and inventory tracking.

## Requirements

### VERIFY:EM-API-005 — Ticket Service with Decimal
TicketService uses Prisma Decimal for price fields. Validates:
- Event exists and belongs to requesting user's tenant before creation
- Price is non-negative (BadRequestException on negative values)
- Quantity is at least 1

### VERIFY:EM-API-006 — Ticket Controller
TicketController maps HTTP methods to TicketService with RBAC guards.
Create and update restricted to ADMIN/ORGANIZER. Delete restricted to ADMIN.

## Verification Criteria

1. Ticket prices use Decimal — no floating-point arithmetic
2. Negative price rejected with BadRequestException
3. Event ownership verified before ticket creation (cross-tenant blocked)
4. Create/update restricted to ADMIN/ORGANIZER, delete to ADMIN
5. Sold count increments correctly and does not exceed quantity

## Data Model

- id: UUID primary key
- type: GENERAL | VIP | EARLY_BIRD (default GENERAL)
- price: Decimal(12,2) — stored as Prisma Decimal, transmitted as string
- quantity: positive integer
- sold: integer (default 0), tracks tickets sold
- eventId: FK to events

## Price Handling

- DTO uses @IsNumberString() for price field
- Service converts to Decimal via `new Decimal(dto.price)`
- Negative price validation throws BadRequestException
- Decimal preserves precision for monetary calculations

## Event Ownership Validation

On create, the service verifies the event exists AND belongs to the requesting
user's tenant (event.tenantId === tenantId from JWT). This prevents cross-tenant
ticket creation.
