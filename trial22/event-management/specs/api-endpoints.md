# API Endpoints Specification

## Overview

RESTful API with NestJS 11. All endpoints except auth and health require JWT authentication.
Multi-tenancy enforced via req.user.tenantId from JWT payload.

## Authentication Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/register | Public | Register new user |
| POST | /auth/login | Public | Login and get tokens |
| GET | /auth/profile | JWT | Get current user profile |

## Domain Endpoints

### Events
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /events | JWT | List events (paginated) |
| GET | /events/:id | JWT | Get event by ID |
| POST | /events | JWT | Create event |
| PUT | /events/:id | JWT | Update event |
| DELETE | /events/:id | JWT + ADMIN/ORGANIZER | Delete event |

### Venues, Tickets, Attendees, Registrations, Speakers, Sessions, Sponsors, Categories, Notifications
All follow the same CRUD pattern (GET list, GET by id, POST, PUT, DELETE)
with tenant scoping and pagination.

### Ticket Types
CRUD operations for ticket type templates linked to events.

### Audit Logs
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /audit-logs | JWT + ADMIN | List audit logs |

## Placeholder Endpoints

### Dashboards
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /dashboards | JWT | Dashboard data |

### Data Sources
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /data-sources | JWT | List data sources |

## Health Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /health | Public | Basic health check |
| GET | /health/ready | Public | Database readiness check |

## Verification

VERIFY: EM-EVENT-001 — EventService implements full CRUD with tenant scoping
VERIFY: EM-EVENT-002 — EventController uses CacheControlInterceptor on GET list
VERIFY: EM-VENUE-001 — VenueService implements CRUD with tenant isolation
VERIFY: EM-VENUE-002 — VenueController follows standard CRUD pattern
VERIFY: EM-TICKET-001 — TicketService handles TicketStatus casting
VERIFY: EM-TICKET-002 — TicketController exposes standard CRUD endpoints
VERIFY: EM-ATTENDEE-001 — AttendeeService provides CRUD with tenant filtering
VERIFY: EM-ATTENDEE-002 — AttendeeController with paginated list endpoint
VERIFY: EM-REG-001 — RegistrationService handles RegistrationStatus
VERIFY: EM-REG-002 — RegistrationController with full CRUD
VERIFY: EM-SPEAKER-001 — SpeakerService includes sessions in queries
VERIFY: EM-SESSION-001 — SessionService handles date conversion and status
VERIFY: EM-SPONSOR-001 — SponsorService handles SponsorTier casting
VERIFY: EM-CAT-001 — CategoryService with slug-based uniqueness
VERIFY: EM-NOTIF-001 — NotificationService handles NotificationType casting
VERIFY: EM-TTYPE-001 — TicketTypeService manages ticket type templates
VERIFY: EM-AUDIT-001 — AuditLogService provides read-only log access
VERIFY: EM-AUDIT-002 — AuditLogController restricts access to ADMIN role

## Pagination

All list endpoints accept `page` and `limit` query parameters.
Pagination uses clampPagination from shared (max 100 per page, default 20).

## Related Specs

See [authentication.md](authentication.md) for auth flow details.
See [security.md](security.md) for RBAC configuration.
