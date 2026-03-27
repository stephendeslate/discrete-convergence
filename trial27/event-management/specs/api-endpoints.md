# API Endpoints Specification

## Overview
RESTful API endpoints for auth, events, venues, ticket types, registrations, audit log, and monitoring.

### VERIFY: EM-API-001 — POST /auth/register creates user and returns JWT
Public endpoint. Accepts email, password, tenantId. Returns `{ accessToken }`.
Validation: email must be valid format, password must meet minimum length requirements.
Error: Returns 409 Conflict if user already exists for the given tenant.
The registration flow creates a User record with a hashed password (see [authentication.md](authentication.md)).

### VERIFY: EM-API-002 — POST /auth/login authenticates and returns JWT
Public endpoint with rate limiting. Accepts email, password. Returns `{ accessToken }`.
Error: Returns 401 Unauthorized for invalid credentials.
Rate limiting: 10 requests per second per IP (see [security.md](security.md) for throttle configuration).
The JWT payload includes sub, email, tenantId, and role claims.

### VERIFY: EM-API-003 — CRUD endpoints for /events
- POST /events — Create event (requires auth). Body: name, description, startDate, endDate, venueId (optional).
- GET /events — List events with pagination (requires auth). Query: page, pageSize. Returns data array with meta.
- GET /events/:id — Get event by ID (requires auth). Returns full event with venue and ticket types.
- PATCH /events/:id — Update event (requires auth). Partial update of event fields.
- DELETE /events/:id — Delete event (requires auth, DRAFT only). Returns 400 if event is not in DRAFT status.
- POST /events/:id/publish — Publish event (requires auth). Transitions DRAFT → PUBLISHED.
- POST /events/:id/cancel — Cancel event (requires auth). Transitions any status → CANCELLED.
Error handling: Returns 404 if event not found or belongs to a different tenant.

### VERIFY: EM-API-004 — CRUD endpoints for /venues
- POST /venues — Create venue (requires auth). Body: name, address, capacity.
- GET /venues — List venues with pagination (requires auth). Query: page, pageSize.
- GET /venues/:id — Get venue by ID (requires auth). Includes associated events count.
- PATCH /venues/:id — Update venue (requires auth). Partial update of venue fields.
- DELETE /venues/:id — Delete venue (requires auth). Returns 400 if venue has active events.
All venue endpoints are tenant-scoped — users can only access venues belonging to their tenant.

### VERIFY: EM-API-005 — Ticket type endpoints nested under events
- GET /events/:eventId/ticket-types — List ticket types for event. Returns all ticket types with availability.
- POST /events/:eventId/ticket-types — Create ticket type for event. Body: name, price, quantity.
Validation: price must be non-negative, quantity must be positive integer.
The event must belong to the requesting user's tenant.

### VERIFY: EM-API-006 — Registration endpoints nested under events
- GET /events/:eventId/registrations — List registrations for event. Returns paginated registration list.
- POST /events/:eventId/registrations — Create registration for event. Body: ticketTypeId, attendeeName, attendeeEmail.
Validation: ticketTypeId must exist and have available capacity (sold < quantity).
Edge case: If capacity is full, registration is created with WAITLISTED status.

### VERIFY: EM-API-007 — GET /audit-log returns paginated audit entries
Protected endpoint. Returns tenant-scoped audit log entries.
Query parameters: page, pageSize. Sorted by createdAt descending (newest first).
Each entry includes action, entity, entityId, userId, metadata, and createdAt.

### VERIFY: EM-API-008 — All protected endpoints require JWT Bearer token
Endpoints without @Public() decorator require valid JWT in Authorization header.
Missing or invalid tokens return 401 Unauthorized.
Expired tokens return 401 Unauthorized with an appropriate message.

### VERIFY: EM-API-009 — All endpoints return consistent error format
Error responses include statusCode, message, timestamp, and path.
The GlobalExceptionFilter ensures this format for all unhandled exceptions.
Validation errors return 400 with an array of constraint violation messages.
