# API Endpoints Specification

## Overview

The API is built with NestJS 11 and exposes RESTful endpoints for event
management. All endpoints except auth and monitoring are protected by
the global JwtAuthGuard and scoped by tenant via the request user context.

## Route Constants

- VERIFY: EM-API-001 — API_ROUTES constant in the shared package defines
  all route paths as a frozen object for consistency across API and frontend.

## Architecture

- VERIFY: EM-ARCH-001 — AppModule registers ThrottlerModule with named
  configs, APP_GUARD (ThrottlerGuard, JwtAuthGuard, RolesGuard),
  APP_FILTER (GlobalExceptionFilter), and APP_INTERCEPTOR
  (ResponseTimeInterceptor).

## Event Endpoints

### EM-EVENT-001: Create Event DTO

- VERIFY: EM-EVENT-001 — CreateEventDto validates title, description,
  startDate, endDate with class-validator decorators. All fields required.

### EM-EVENT-002: Event Service

- VERIFY: EM-EVENT-002 — EventService implements CRUD operations scoped
  by tenantId. Uses clampPagination from shared for list operations.
  Includes $executeRaw for tenant-context SQL.

### EM-EVENT-003: Event Controller

- VERIFY: EM-EVENT-003 — EventController exposes GET/POST/PUT/DELETE
  endpoints, extracting tenantId from @Req() user context for all operations.

## Venue Endpoints

### EM-VENUE-001: Create Venue DTO

- VERIFY: EM-VENUE-001 — CreateVenueDto validates name, address, capacity
  fields. Capacity must be a positive integer.

### EM-VENUE-002: Venue Service

- VERIFY: EM-VENUE-002 — VenueService implements CRUD operations scoped
  by tenantId with pagination support.

### EM-VENUE-003: Venue Controller

- VERIFY: EM-VENUE-003 — VenueController applies @Roles('ADMIN', 'ORGANIZER')
  on create and @Roles('ADMIN') on delete for RBAC enforcement.

## Ticket Endpoints

### EM-TICKET-001: Create Ticket DTO

- VERIFY: EM-TICKET-001 — CreateTicketDto validates eventId, price, and
  optional attendeeId. Price accepts numeric values.

### EM-TICKET-002: Ticket Service

- VERIFY: EM-TICKET-002 — TicketService implements CRUD operations with
  tenant scoping and pagination using clampPagination.

### EM-TICKET-003: Ticket Controller

- VERIFY: EM-TICKET-003 — TicketController exposes tenant-scoped endpoints
  with @Req() extraction on all methods.

## Schedule Endpoints

### EM-SCHED-001: Create Schedule DTO

- VERIFY: EM-SCHED-001 — CreateScheduleDto validates eventId, title,
  description, startTime, endTime with class-validator decorators.

### EM-SCHED-002: Schedule Service

- VERIFY: EM-SCHED-002 — ScheduleService implements CRUD operations with
  tenant scoping and pagination support.

### EM-SCHED-003: Schedule Controller

- VERIFY: EM-SCHED-003 — ScheduleController exposes tenant-scoped endpoints
  extracting tenantId from the authenticated user context.

## Attendee Endpoints

### EM-ATTEND-001: Create Attendee DTO

- VERIFY: EM-ATTEND-001 — CreateAttendeeDto validates eventId and userId
  fields as required UUID strings.

### EM-ATTEND-002: Attendee Service

- VERIFY: EM-ATTEND-002 — AttendeeService implements CRUD with tenant
  scoping. Uses findFirst with justification comments for lookup operations.

### EM-ATTEND-003: Attendee Controller

- VERIFY: EM-ATTEND-003 — AttendeeController exposes tenant-scoped
  endpoints with @Req() user context extraction.

## Pagination

All list endpoints accept page and pageSize query parameters, clamped
by MAX_PAGE_SIZE (100) from the shared package.
