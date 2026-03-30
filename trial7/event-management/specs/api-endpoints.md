# API Endpoints Specification

## Overview

All endpoints require JWT authentication unless marked with @Public(). The API
follows RESTful conventions with full CRUD for domain entities. Pagination uses
clamped page/pageSize parameters. Cache-Control headers are set on list endpoints.

See also: [authentication.md](authentication.md) for auth flow details.
See also: [data-model.md](data-model.md) for entity schemas.

## Event Endpoints

- VERIFY: EM-EVT-001 — CreateEventDto validates title, description, startDate,
  endDate, price (number), capacity (int), venueId, categoryId with class-validator
- VERIFY: EM-EVT-002 — UpdateEventDto validates optional fields including status
  (enum values via @IsIn) with class-validator decorators
- VERIFY: EM-EVT-003 — EventService provides create, findAll (paginated), findOne
  (tenant-scoped), update, remove, and getEventStats operations
- VERIFY: EM-EVT-004 — EventController exposes GET/POST/PUT/DELETE /events with
  authentication, pagination, and Cache-Control headers

### Routes
| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | /events | JWT | any | Create event |
| GET | /events | JWT | any | List events (paginated) |
| GET | /events/:id | JWT | any | Get event by ID |
| PUT | /events/:id | JWT | any | Update event |
| DELETE | /events/:id | JWT | ADMIN, ORGANIZER | Delete event |
| GET | /events/stats/summary | JWT | ADMIN | Event statistics |

## Ticket Endpoints

- VERIFY: EM-TKT-001 — CreateTicketDto validates eventId, price, optional seatInfo
- VERIFY: EM-TKT-002 — UpdateTicketDto validates optional status and seatInfo
- VERIFY: EM-TKT-003 — TicketService provides CRUD with tenant-scoped queries
- VERIFY: EM-TKT-004 — TicketController exposes GET/POST/PUT/DELETE /tickets

### Routes
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /tickets | JWT | Purchase ticket |
| GET | /tickets | JWT | List tickets |
| GET | /tickets/:id | JWT | Get ticket |
| PUT | /tickets/:id | JWT | Update ticket |
| DELETE | /tickets/:id | JWT | Cancel ticket |

## Venue Endpoints

- VERIFY: EM-VEN-001 — CreateVenueDto validates name, address, city, capacity
- VERIFY: EM-VEN-002 — UpdateVenueDto validates optional venue fields
- VERIFY: EM-VEN-003 — VenueService provides CRUD with tenant-scoped queries
- VERIFY: EM-VEN-004 — VenueController exposes CRUD with @Roles for create/update/delete

### Routes
| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | /venues | JWT | ADMIN, ORGANIZER | Create venue |
| GET | /venues | JWT | any | List venues |
| GET | /venues/:id | JWT | any | Get venue |
| PUT | /venues/:id | JWT | ADMIN, ORGANIZER | Update venue |
| DELETE | /venues/:id | JWT | ADMIN | Delete venue |

## Category Endpoints

- VERIFY: EM-CAT-001 — CreateCategoryDto validates name and optional description
- VERIFY: EM-CAT-002 — UpdateCategoryDto validates optional category fields
- VERIFY: EM-CAT-003 — CategoryService provides CRUD with tenant-scoped queries
- VERIFY: EM-CAT-004 — CategoryController exposes CRUD with @Roles for write ops

## Audit Log Endpoints

- VERIFY: EM-AUD-001 — CreateAuditLogDto validates action (enum), entity, entityId
- VERIFY: EM-AUD-002 — AuditLogService provides create and findAll with pagination
- VERIFY: EM-AUD-003 — AuditLogController exposes POST and GET /audit-logs (GET is admin-only)

## Pagination

All list endpoints accept optional page and pageSize query parameters.
Page size is clamped to MAX_PAGE_SIZE (100), default is DEFAULT_PAGE_SIZE (20).
Response format: { data: T[], total: number, page: number, pageSize: number }
