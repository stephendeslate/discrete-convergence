# API Endpoints Specification

## VERIFY:EM-API-001 — Event CRUD
EventService provides create, findAll (paginated, tenant-scoped), findOne, update, delete.

## VERIFY:EM-API-002 — Event Controller
EventController maps HTTP methods to EventService with tenant extraction from JWT.

## VERIFY:EM-API-003 — Venue CRUD
VenueService provides create, findAll (paginated, tenant-scoped), findOne, update, delete.

## VERIFY:EM-API-004 — Venue Controller
VenueController maps HTTP methods to VenueService with tenant extraction from JWT.

## VERIFY:EM-API-005 — Ticket CRUD with Decimal
TicketService uses Decimal for price fields. Validates event ownership before creation.

## VERIFY:EM-API-006 — Ticket Controller
TicketController maps HTTP methods to TicketService with RBAC guards.

## VERIFY:EM-API-007 — Attendee CRUD
AttendeeService manages registration and check-in status. Validates event and ticket existence.

## VERIFY:EM-API-008 — Attendee Controller
AttendeeController maps HTTP methods to AttendeeService with RBAC guards.

## VERIFY:EM-API-009 — Tenant CRUD
TenantService provides full CRUD with subscription tier management.

## VERIFY:EM-API-010 — Tenant Controller
TenantController restricted to ADMIN role at class level.

## VERIFY:EM-API-011 — Audit Log Read
AuditLogService provides read-only access with tenant-scoped filtering and entity filter.

## VERIFY:EM-API-012 — Audit Log Controller
AuditLogController restricted to ADMIN role with tenant-scoped access.

## Endpoints Summary

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | /auth/register | Public | - | Register user |
| POST | /auth/login | Public | - | Login |
| GET | /events | JWT | Any | List events (paginated) |
| POST | /events | JWT | ADMIN, ORGANIZER | Create event |
| GET | /events/:id | JWT | Any | Get event |
| PATCH | /events/:id | JWT | ADMIN, ORGANIZER | Update event |
| DELETE | /events/:id | JWT | ADMIN | Delete event |
| GET | /venues | JWT | Any | List venues |
| POST | /venues | JWT | ADMIN, ORGANIZER | Create venue |
| GET | /venues/:id | JWT | Any | Get venue |
| PATCH | /venues/:id | JWT | ADMIN, ORGANIZER | Update venue |
| DELETE | /venues/:id | JWT | ADMIN | Delete venue |
| GET | /tickets | JWT | Any | List tickets by event |
| POST | /tickets | JWT | ADMIN, ORGANIZER | Create ticket |
| GET | /tickets/:id | JWT | Any | Get ticket |
| PATCH | /tickets/:id | JWT | ADMIN, ORGANIZER | Update ticket |
| DELETE | /tickets/:id | JWT | ADMIN | Delete ticket |
| GET | /attendees | JWT | Any | List attendees by event |
| POST | /attendees | JWT | ADMIN, ORGANIZER | Register attendee |
| GET | /attendees/:id | JWT | Any | Get attendee |
| PATCH | /attendees/:id | JWT | ADMIN, ORGANIZER | Update attendee |
| DELETE | /attendees/:id | JWT | ADMIN | Delete attendee |
| GET | /tenants | JWT | ADMIN | List tenants |
| POST | /tenants | JWT | ADMIN | Create tenant |
| GET | /tenants/:id | JWT | ADMIN | Get tenant |
| PATCH | /tenants/:id | JWT | ADMIN | Update tenant |
| DELETE | /tenants/:id | JWT | ADMIN | Delete tenant |
| GET | /audit-logs | JWT | ADMIN | List audit logs |
| GET | /monitoring/health | Public | - | Health check |
| GET | /monitoring/ready | Public | - | Readiness check |
