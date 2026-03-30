# API Endpoints Specification

## Overview

The Event Management API is built with NestJS 11 and provides RESTful endpoints for event management operations. All endpoints except auth and health require JWT authentication.

See also: [Authentication](authentication.md) for auth flow details.
See also: [Data Model](data-model.md) for entity definitions.

## Event Endpoints

VERIFY: EM-EVENT-001
CreateEventDto validates title (string, max 255), description (string, max 2000), startDate (ISO date string), endDate (ISO date string), capacity (integer, min 1), and venueId (string, max 36).

VERIFY: EM-EVENT-002
UpdateEventDto allows partial updates with optional title, description, dates, capacity, venueId, and status fields. Status restricted to valid EventStatus values.

VERIFY: EM-EVENT-003
EventService provides create, findAll (paginated), findOne, update, and remove methods. All operations are tenant-scoped.

VERIFY: EM-EVENT-004
EventController at /events provides POST (create), GET (list with pagination), GET /:id (detail), PUT /:id (update), DELETE /:id (remove with ADMIN/ORGANIZER role), GET /stats/summary.

## Venue Endpoints

VERIFY: EM-VENUE-001
CreateVenueDto validates name (string, max 255), address (string, max 500), city (string, max 100), capacity (integer, min 1).

VERIFY: EM-VENUE-002
UpdateVenueDto allows partial updates for all venue fields.

VERIFY: EM-VENUE-003
VenueService provides full CRUD with tenant-scoped queries and pagination.

VERIFY: EM-VENUE-004
VenueController at /venues provides full CRUD. DELETE requires ADMIN role.

## Schedule Endpoints

VERIFY: EM-SCHED-001
CreateScheduleDto validates title, speaker, startTime, endTime, room, and eventId.

VERIFY: EM-SCHED-002
UpdateScheduleDto allows partial updates for schedule fields.

VERIFY: EM-SCHED-003
ScheduleService provides full CRUD with tenant-scoped queries and event relation includes.

VERIFY: EM-SCHED-004
ScheduleController at /schedules provides full CRUD with tenant scoping via req.user.

## Ticket Endpoints

VERIFY: EM-TICKET-001
CreateTicketDto validates price (number, max 2 decimals, min 0), type (string, max 100), eventId (string, max 36).

VERIFY: EM-TICKET-002
UpdateTicketDto allows partial updates for price, type, and status.

VERIFY: EM-TICKET-003
TicketService provides full CRUD with tenant-scoped queries and status management.

VERIFY: EM-TICKET-004
TicketController at /tickets provides full CRUD with tenant scoping.

## Attendee Endpoints

VERIFY: EM-ATTEND-001
CreateAttendeeDto validates userId (string, max 36) and eventId (string, max 36).

VERIFY: EM-ATTEND-002
AttendeeService provides create (with duplicate check), findAll, findOne, and remove. Prevents duplicate registrations.

VERIFY: EM-ATTEND-003
AttendeeController at /attendees provides POST, GET, GET /:id, DELETE with tenant scoping.

## Pagination

All list endpoints support pagination via query parameters:
- `page`: page number (default 1)
- `pageSize`: items per page (clamped to MAX_PAGE_SIZE=100, default 20)
