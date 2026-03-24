# SPEC-004: Attendees

**Status:** APPROVED
**Priority:** P1
**Cross-References:** SPEC-002 (Events), SPEC-003 (Tickets), SPEC-008 (Security)

## Overview

Attendee registration and check-in status management with event and ticket
validation, event-scoped queries, and status tracking.

## Requirements

### VERIFY:EM-API-007 — Attendee Service
AttendeeService manages registration and check-in:
- Create: validates event exists, validates ticket exists and belongs to event
- FindAll: event-scoped with pagination, includes ticket data
- FindOne: includes ticket and event data
- Update: supports name, email, checkInStatus changes
- Delete: ADMIN only

### VERIFY:EM-API-008 — Attendee Controller
AttendeeController maps HTTP methods to AttendeeService with RBAC guards.
Create and update restricted to ADMIN/ORGANIZER. Delete restricted to ADMIN.
FindAll requires eventId query parameter.

## Data Model

- id: UUID primary key
- name: string (max 255)
- email: email (max 255)
- checkInStatus: REGISTERED | CHECKED_IN | NO_SHOW (default REGISTERED)
- eventId: FK to events
- ticketId: FK to tickets

## Check-In Flow

1. Attendee created with REGISTERED status
2. Organizer updates to CHECKED_IN at event
3. NO_SHOW set post-event for unattended registrations

## Validation

- Event must exist before attendee creation
- Ticket must exist AND belong to the specified event
- Cross-event ticket assignment is rejected with NotFoundException
