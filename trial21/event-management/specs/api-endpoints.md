# API Endpoints Specification

## Overview
The Event Management API is a NestJS 11 application serving RESTful endpoints.
All endpoints require JWT authentication unless marked @Public().
See [authentication.md](authentication.md) for auth flow.

## Endpoint Listing

### Auth (Public)
- POST /auth/login — Login with email/password
- POST /auth/register — Register new attendee
- POST /auth/refresh — Refresh access token

### Organizations
- GET /organizations/me — Get current organization
- PATCH /organizations/me — Update organization (ADMIN only)

### Events
- POST /events — Create event (ADMIN, ORGANIZER)
- GET /events — List events (paginated)
- GET /events/:id — Get event details
- PATCH /events/:id — Update event (ADMIN, ORGANIZER)
- DELETE /events/:id — Delete event (ADMIN)
- POST /events/:id/publish — Publish event
- POST /events/:id/cancel — Cancel event

### Sessions
- POST /events/:eventId/sessions — Create session
- GET /events/:eventId/sessions — List sessions
- GET /events/:eventId/sessions/:sessionId — Get session
- PATCH /events/:eventId/sessions/:sessionId — Update session
- DELETE /events/:eventId/sessions/:sessionId — Delete session

### Venues
- POST /venues — Create venue
- GET /venues — List venues (paginated)
- GET /venues/:id — Get venue
- PATCH /venues/:id — Update venue
- DELETE /venues/:id — Delete venue

### Ticket Types
- POST /events/:eventId/ticket-types — Create ticket type
- GET /events/:eventId/ticket-types — List ticket types
- GET /events/:eventId/ticket-types/:ticketTypeId — Get ticket type
- PATCH /events/:eventId/ticket-types/:ticketTypeId — Update
- DELETE /events/:eventId/ticket-types/:ticketTypeId — Delete

### Registrations
- POST /events/:eventId/register — Register for event
- GET /events/:eventId/registrations — List registrations
- GET /my-registrations — User's registrations
- POST /registrations/:registrationId/cancel — Cancel registration

### Check-in
- POST /check-in/:registrationId — Check in (idempotent)
- GET /check-in/stats?eventId= — Check-in statistics

### Waitlist
- GET /waitlist?eventId= — List waitlist
- POST /waitlist/:eventId/promote/:entryId — Promote entry

### Notifications
- GET /notifications — User notifications (paginated)
- POST /notifications/broadcast — Send to users (ADMIN, ORGANIZER)

### Public (No auth)
- GET /public/events — Public event listing
- GET /public/events/:slug — Event by slug

### Infrastructure
- GET /health — Health check (public)
- GET /health/ready — Readiness check (public)
- GET /metrics — Metrics (public)
- GET /dashboards — Placeholder (returns [])
- GET /data-sources — Placeholder (returns [])

### Audit
- GET /audit-log — Audit log (ADMIN, paginated)

## Validation
All DTOs use class-validator decorators (see [security.md](security.md)):
- @IsString() + @MaxLength() on all string fields
- @MaxLength(36) on UUID fields
- @IsEmail() on email fields
- @IsIn(ALLOWED_REGISTRATION_ROLES) on role field
- @IsInt() + @Min() on numeric fields
- @IsDateString() on date fields

## VERIFY Tags
VERIFY: EM-API-001 — Maximum page size for paginated queries
VERIFY: EM-API-002 — Default page size for paginated queries
VERIFY: EM-API-003 — Paginated query DTO with validated bounds
VERIFY: EM-API-004 — Build Prisma skip/take from page/limit
VERIFY: EM-EVT-001 — CreateEventDto with validated fields
VERIFY: EM-EVT-002 — Valid status transitions for event lifecycle
VERIFY: EM-EVT-003 — Event CRUD controller
VERIFY: EM-EVT-004 — Session DTO with time validation
VERIFY: EM-EVT-005 — Session service with parent event window validation
VERIFY: EM-EVT-006 — Public event discovery
VERIFY: EM-REG-001 — Registration DTO
VERIFY: EM-REG-002 — Registration service with capacity checks and waitlist
VERIFY: EM-REG-003 — Check sold out before registration
VERIFY: EM-REG-004 — Auto-promote from waitlist FIFO on cancellation
VERIFY: EM-REG-005 — Registration endpoints
VERIFY: EM-CHK-001 — Check-in service with idempotent scanning
VERIFY: EM-CHK-002 — Idempotent check-in (scanning twice returns already checked in)
VERIFY: EM-CHK-003 — Check-in endpoints
VERIFY: EM-WTL-001 — Waitlist service with FIFO promotion
VERIFY: EM-NTF-001 — Notification broadcast DTO
VERIFY: EM-VEN-001 — Venue DTO with capacity validation
VERIFY: EM-TKT-001 — TicketType DTO, price in cents (Int)
VERIFY: EM-TKT-002 — TicketType CRUD with tenant isolation
VERIFY: EM-TST-001 — Unit test coverage for all service modules
VERIFY: EM-TST-002 — Integration test coverage for API endpoints
## Cross-References
- [data-model.md](data-model.md) — Entity definitions
- [security.md](security.md) — Validation and auth rules
- [frontend.md](frontend.md) — Client-side route matching
