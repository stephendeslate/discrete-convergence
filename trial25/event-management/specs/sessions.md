# Sessions Domain Specification

## Overview

Sessions represent individual talks or activities within an event.
Sessions have lifecycle states (DRAFT, CONFIRMED, CANCELLED) and can be assigned to speakers.
Session operations are secured with JWT authentication and tenant isolation per [security.md](security.md).
Sessions follow the data model constraints defined in [data-model.md](data-model.md).

## Requirements

### EM-SES-001 — Session CRUD
Standard CRUD operations: create, read (single + list), update, delete.
All operations scoped to current tenant via RLS and TenantGuard.
List endpoint supports pagination with page/pageSize parameters.
<!-- VERIFY:EM-SES-001 — Session CRUD operations with tenant isolation -->

### EM-SES-002 — Session Status Lifecycle
Sessions follow status transitions: DRAFT -> CONFIRMED or CANCELLED.
- confirmSession(): Only DRAFT sessions can be confirmed
- cancelSession(): Only DRAFT or CONFIRMED sessions can be cancelled
<!-- VERIFY:EM-SES-002 — Session status lifecycle transitions enforced -->

### EM-SES-003 — Confirm Session Action
SessionService.confirmSession() validates session is in DRAFT status.
Returns 400 if session is not in DRAFT status.
Also validates a speaker is assigned before confirmation.
Checks parent event is not cancelled.
Contains branching logic: check status -> validate speaker -> update to CONFIRMED.
<!-- VERIFY:EM-SES-003 — Confirm session validates DRAFT status and speaker assigned -->

### EM-SES-004 — Cancel Session Action
SessionService.cancelSession() validates session is in DRAFT or CONFIRMED status.
Returns 400 if session is already CANCELLED.
Contains branching logic: check status -> validate transition -> update to CANCELLED.
<!-- VERIFY:EM-SES-004 — Cancel session validates not already cancelled -->

### EM-SES-005 — Session Time Validation
End time must be strictly after start time.
Validation applies to both create and update operations.
Returns 400 with descriptive error message if times are invalid.
<!-- VERIFY:EM-SES-005 — edge case: invalid time range returns validation error -->

### EM-SES-006 — Session-Speaker Relationship
Sessions optionally reference a speaker via speakerId foreign key.
Speaker must exist in the same tenant when assigned.
<!-- VERIFY:EM-SES-006 — Session-speaker relationship with optional FK -->

## Data Model

| Field | Type | Constraints |
|-------|------|-------------|
| id | UUID | Primary key |
| tenantId | UUID | Required, RLS filtered |
| eventId | UUID | Required FK to Event |
| speakerId | UUID | Optional FK to Speaker |
| title | String | Required, max 200 |
| description | String | Optional, max 2000 |
| startTime | DateTime | Required |
| endTime | DateTime | Required, must be after startTime |
| status | SessionStatus | Default: DRAFT |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

## Relationships

- Session belongs to Event (required)
- Session optionally belongs to Speaker
