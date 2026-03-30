# API Endpoints Specification

## Overview

The Event Management API provides RESTful endpoints for managing events, venues,
registrations, notifications, and monitoring. All domain endpoints require JWT
authentication via the global APP_GUARD (no per-controller @UseGuards).

See [authentication.md](authentication.md) for auth flow details.
See [data-model.md](data-model.md) for entity definitions.

## Requirements

### VERIFY:EM-API-001 — Event CRUD Endpoints
The EventController provides full CRUD for events:
- POST /events (create), GET /events (list), GET /events/:id (detail)
- PATCH /events/:id (update), DELETE /events/:id (remove)
- PATCH /events/:id/publish, PATCH /events/:id/cancel
- GET /events/public/discovery (public, no auth required)
No `@UseGuards` decorator — relies on global APP_GUARD.

### VERIFY:EM-API-002 — Event Service with N+1 Prevention
The EventService uses Prisma `include` on all queries to prevent N+1 queries.
Event queries include venue, ticketTypes, sessions, and registration counts
as appropriate for each operation.

### VERIFY:EM-API-003 — Venue CRUD Endpoints
The VenueController provides full CRUD for venues:
- POST /venues, GET /venues, GET /venues/:id
- PATCH /venues/:id, DELETE /venues/:id
All queries scoped by organizationId for tenant isolation.

### VERIFY:EM-API-004 — Registration Endpoints
The RegistrationController provides:
- POST /events/:eventId/register (create registration)
- GET /events/:eventId/registrations (list by event)
- PATCH /registrations/:id/cancel (cancel registration)
- POST /check-in/:registrationId (check-in with idempotency)
- GET /events/:eventId/check-in-stats (live counter)

### VERIFY:EM-API-005 — Registration Business Logic
Registration service enforces:
- Event must be in PUBLISHED or REGISTRATION_OPEN status
- Ticket type must belong to the event
- Ticket type must not be sold out (sold < quota)
- Check-in is idempotent (returns existing check-in if already scanned)
- Cancellation decrements sold count on ticket type

### VERIFY:EM-API-006 — Notification Endpoints
The NotificationController provides:
- GET /notifications (list all for organization)
- POST /events/:eventId/notify (broadcast notification)
All scoped by organizationId for tenant isolation.

## DTO Validation

All DTOs use class-validator decorators:
- String fields: `@IsString()` + `@MaxLength()`
- UUID fields: `@IsString()` + `@MaxLength(36)`
- Email fields: `@IsEmail()` + `@IsString()` + `@MaxLength()`
- Date fields: `@IsDateString()` + `@MaxLength(30)`

## Pagination

All list endpoints accept `page` and `pageSize` query parameters.
Pagination uses clamping (not rejection): values exceeding MAX_PAGE_SIZE (100)
are clamped down. Default page size is 20.

## Response Format

List endpoints return: `{ items, total, page, pageSize }`
Detail endpoints return the entity with included relations.
Error responses include: `{ statusCode, message, correlationId, timestamp }`
