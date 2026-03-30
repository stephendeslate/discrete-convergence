# Attendees Specification

## Overview

Attendees represent people registered for events. They can be registered and checked in.
The check-in process validates attendee and event status before marking attendance.
Attendee operations enforce tenant isolation as described in [security.md](security.md).
Attendees follow the data model defined in [data-model.md](data-model.md).

## Requirements

### EM-ATT-001 — Attendee Registration
POST /attendees registers a new attendee for an event.
Required fields: name, email, eventId. Event must exist and not be CANCELLED or COMPLETED.
Duplicate email+event combination returns 409/400 error.
Event capacity is checked before allowing registration.
<!-- VERIFY:EM-ATT-001 — Attendee registration validates event status and uniqueness -->

### EM-ATT-002 — Attendee Check-In
PATCH /attendees/:id/check-in marks an attendee as checked in.
Must throw BadRequestException if:
- Attendee is already checked in (duplicate check-in prevention)
- Event associated with attendee is CANCELLED
Domain-action method has if/throw branching logic.
Sets checkedIn to true and checkedInAt to current timestamp.
<!-- VERIFY:EM-ATT-002 — Check-in validates not already checked in and event not cancelled -->

### EM-ATT-003 — Attendee Listing
GET /attendees returns paginated results scoped to tenant.
Supports standard pagination parameters (page, pageSize).
Results ordered by creation date descending.
<!-- VERIFY:EM-ATT-003 — Attendee listing returns tenant-scoped paginated results -->

### EM-ATT-004 — Attendee Validation
Email must be valid format. Name is required with MaxLength constraint.
EventId must be a valid UUID with MaxLength(36).
Phone is optional with MaxLength constraint.
<!-- VERIFY:EM-ATT-004 — edge case: invalid attendee data returns validation error -->

### EM-ATT-005 — Duplicate Check-In Prevention
The check-in endpoint must reject attempts to check in an already checked-in attendee.
This is an edge case boundary check that prevents data corruption.
Returns 400 Bad Request with descriptive error message.
<!-- VERIFY:EM-ATT-005 — edge case: duplicate check-in returns error -->

## Data Model

| Field | Type | Constraints |
|-------|------|------------|
| id | UUID | Primary key |
| name | String | Required, MaxLength(200) |
| email | String | Required, valid email |
| phone | String | Optional, MaxLength(50) |
| eventId | String | Required, UUID, MaxLength(36) |
| tenantId | String | Set from auth context |
| checkedIn | Boolean | Default: false |
| checkedInAt | DateTime | Set on check-in |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

## Relationships

- Attendee belongs to Event (required via eventId FK)
- Attendee has many Tickets (optional)
