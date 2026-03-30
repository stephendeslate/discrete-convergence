# API Endpoints Specification

> **Project:** Event Management
> **Category:** API
> **Cross-references:** See [authentication.md](authentication.md), [data-model.md](data-model.md)

---

## Requirements

### VERIFY:EM-API-001 — Event CRUD

Full CRUD for events:
- `POST /events` — creates event with status DRAFT
- `GET /events/:id` — returns single event with venue include
- `GET /events` — paginated list with optional status filter
- `PATCH /events/:id` — updates event fields (only DRAFT events editable)
- `DELETE /events/:id` — soft delete
- `PATCH /events/:id/status` — validates against event lifecycle state machine

Only valid transitions allowed. Invalid transitions return 400 with allowed transitions.
All endpoints scoped to the authenticated user's organization via tenantId.

### VERIFY:EM-API-002 — Registration Endpoint

`POST /events/:id/register` checks:
- Event is in REGISTRATION_OPEN status
- Ticket type has remaining capacity
- User not already registered for this event

On capacity full, adds to waitlist with WAITLISTED status. Returns registration with
status. Capacity check uses a transaction to prevent race conditions.

### VERIFY:EM-API-003 — Venue CRUD

Full CRUD for venues with capacity integer field. Venues are organization-scoped.
- `POST /venues` — create venue
- `GET /venues` — paginated list
- `GET /venues/:id` — single venue
- `PATCH /venues/:id` — update venue
- `DELETE /venues/:id` — delete (prevented if venue has upcoming events)

### VERIFY:EM-API-004 — DTO Validation

All request DTOs use class-validator decorators:
- Create DTOs require all mandatory fields
- Update DTOs use `@IsOptional()` on all fields
- `@IsString()` paired with `@MaxLength()` on all string fields
- `@MaxLength(36)` on all UUID fields
- `@IsEmail()` on email fields
- Nested DTOs use `@ValidateNested()` + `@Type()`

See [authentication.md](authentication.md) for auth-specific DTO validation rules.

### VERIFY:EM-API-005 — Pagination

List endpoints accept `page` and `pageSize` query parameters. `clampPagination()` from
shared package enforces max page size (100) and default page size (20). Clamping, not
rejection — values above max are silently reduced. Response shape:
`{ data: T[], total: number, page: number, pageSize: number }`.

### VERIFY:EM-API-006 — Cache-Control

List endpoints set `Cache-Control: private, max-age=60` header via `response.setHeader()`.
Public event discovery sets `Cache-Control: public, max-age=300, s-maxage=600`.
Cache-Control headers set on every controller method that returns a list.
