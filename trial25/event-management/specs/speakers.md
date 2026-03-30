# Speakers Specification

## Overview

Speakers represent presenters for event sessions.
Each speaker has a name, bio, email, and can be assigned to multiple sessions.
Speaker operations are secured with JWT authentication and tenant isolation per [security.md](security.md).
Speakers follow the data model constraints defined in [data-model.md](data-model.md).

## Requirements

### EM-SPK-001 — Speaker CRUD
Full CRUD operations for speakers: create, read, update, delete.
Required fields: name, email. Bio is optional.
All operations scoped to tenant via TenantGuard and AuthGuard.
List endpoint supports pagination with page/pageSize parameters.
<!-- VERIFY:EM-SPK-001 — Speaker CRUD operations with tenant isolation -->

### EM-SPK-002 — Speaker Listing
GET /speakers returns paginated results scoped to tenant.
Supports standard pagination parameters (page, pageSize).
Results ordered by creation date descending.
<!-- VERIFY:EM-SPK-002 — Speaker listing returns tenant-scoped paginated results -->

### EM-SPK-003 — Speaker Validation
Email must be valid format. Name is required with MaxLength(200).
Bio is optional with MaxLength(2000).
All string fields constrained with @MaxLength decorator.
<!-- VERIFY:EM-SPK-003 — edge case: invalid speaker data returns validation error -->

### EM-SPK-004 — Speaker-Session Relationship
Speakers have a one-to-many relationship with sessions.
A speaker can be assigned to multiple sessions across different events.
Sessions reference speakers via speakerId foreign key.
<!-- VERIFY:EM-SPK-004 — Speaker has one-to-many relationship with sessions -->

### EM-SPK-005 — Speaker Audit Trail
All speaker operations (create, update, delete) are logged to the audit trail.
Audit entries include action type and speaker entity ID.
<!-- VERIFY:EM-SPK-005 — Speaker operations logged to audit trail -->

## Data Model

| Field | Type | Constraints |
|-------|------|------------|
| id | UUID | Primary key |
| name | String | Required, MaxLength(200) |
| bio | String | Optional, MaxLength(2000) |
| email | String | Required, valid email |
| tenantId | String | Set from auth context |
| createdAt | DateTime | Auto |
| updatedAt | DateTime | Auto |

## Relationships

- Speaker has many Sessions (via speakerId foreign key)
- Speaker belongs to a tenant (via tenantId)
