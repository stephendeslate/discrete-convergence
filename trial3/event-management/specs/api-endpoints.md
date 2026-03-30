# API Endpoints Specification

## Overview

The Event Management API provides RESTful endpoints for managing events, venues,
registrations, check-ins, notifications, and monitoring. All domain endpoints require
JWT authentication via the global APP_GUARD. See [authentication.md](authentication.md) for auth details.

## Endpoint Inventory

### Auth Endpoints (Public)
- POST /auth/register — Create new user account
- POST /auth/login — Authenticate and receive JWT token

### Event Endpoints (Authenticated)
- POST /events — Create a new event
- GET /events — List events (paginated, Cache-Control header)
- GET /events/:id — Get event details with venue and sessions
- PATCH /events/:id — Update event (rejected if COMPLETED)
- DELETE /events/:id — Delete event
- PATCH /events/:id/publish — Transition from DRAFT to PUBLISHED
- PATCH /events/:id/cancel — Cancel event (rejected if COMPLETED)

### Venue Endpoints (Authenticated)
- POST /venues — Create a new venue
- GET /venues — List venues (paginated, Cache-Control header)
- GET /venues/:id — Get venue details
- PATCH /venues/:id — Update venue
- DELETE /venues/:id — Delete venue

### Registration Endpoints (Authenticated)
- POST /events/:eventId/register — Register for an event
- GET /events/:eventId/registrations — List event registrations (paginated, Cache-Control)
- PATCH /registrations/:id/cancel — Cancel a registration

### Check-In Endpoints (Authenticated)
- POST /check-in/:registrationId — Check in a registration
- GET /events/:eventId/check-in-stats — Get check-in statistics

### Notification Endpoints (Authenticated)
- GET /notifications — List notifications (paginated, Cache-Control)
- POST /events/:eventId/notify — Broadcast notification to event attendees

### Monitoring Endpoints
- GET /health — Public, SkipThrottle, returns status + version + uptime
- GET /health/ready — Public, SkipThrottle, DB connectivity check
- GET /metrics — Authenticated, returns request/error counts

## Requirements

### VERIFY:EM-EVT-001
EventService must implement: create, findAll (paginated), findOne, update, remove, publish, cancel.
Update must reject changes to COMPLETED events. Publish only works on DRAFT events.
Cancel is rejected for COMPLETED events.

### VERIFY:EM-EVT-002
EventController must use @Header('Cache-Control', ...) on the findAll endpoint.
Controller must not use @UseGuards — relies on global APP_GUARD.

### VERIFY:EM-VEN-001
VenueService must implement: create, findAll (paginated), findOne, update, remove.
All operations scoped by organizationId for multi-tenant isolation.

### VERIFY:EM-VEN-002
VenueController must use @Header('Cache-Control', ...) on the findAll endpoint.

### VERIFY:EM-REG-001
RegistrationService must handle: register (with ticket quota check), findAllForEvent, cancel.
Registration uses Prisma transactions to atomically update soldCount.

### VERIFY:EM-REG-002
RegistrationController exposes event-scoped registration endpoints.

### VERIFY:EM-CHK-001
CheckInService implements idempotent check-in: rejects if already checked in.
Only CONFIRMED registrations can be checked in.

### VERIFY:EM-CHK-002
CheckInController provides POST /check-in/:registrationId and GET /events/:eventId/check-in-stats.

### VERIFY:EM-NOT-001
NotificationService implements findAll (paginated) and broadcast (creates notification per attendee).

### VERIFY:EM-NOT-002
NotificationController provides GET /notifications and POST /events/:eventId/notify.

## Pagination

- All list endpoints support page and limit query parameters
- Default page size: 20, maximum: 100 (clamped, not rejected)
- Responses include: data, total, page, limit, totalPages
