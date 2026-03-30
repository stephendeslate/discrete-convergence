# API Endpoints Specification

## Overview

The Event Management API exposes RESTful endpoints for CRUD operations on
Events, Venues, Attendees, and Registrations. All endpoints (except auth
and health) require JWT authentication and enforce tenant isolation.

## Event Endpoints

VERIFY: EM-EVENT-001 — Event controller enforces @Roles('ADMIN') on create, update, delete

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | /events | Yes | ADMIN | Create event |
| GET | /events | Yes | Any | List events (paginated) |
| GET | /events/:id | Yes | Any | Get event by ID |
| PUT | /events/:id | Yes | ADMIN | Update event |
| DELETE | /events/:id | Yes | ADMIN | Delete event |

VERIFY: EM-EVENT-002 — Event list endpoint returns Cache-Control header

All list endpoints return paginated responses with:
- data: array of entities
- total: total count
- page: current page number
- limit: items per page

See: performance.md for pagination strategy
See: authentication.md for JWT guard

## Venue Endpoints

VERIFY: EM-VENUE-001 — Venue service scopes all queries by tenantId
VERIFY: EM-VENUE-002 — Venue controller requires authentication

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | /venues | Yes | ADMIN | Create venue |
| GET | /venues | Yes | Any | List venues |
| GET | /venues/:id | Yes | Any | Get venue by ID |
| PUT | /venues/:id | Yes | ADMIN | Update venue |
| DELETE | /venues/:id | Yes | ADMIN | Delete venue |

## Attendee Endpoints

VERIFY: EM-ATTEND-001 — Attendee service scopes all queries by tenantId
VERIFY: EM-ATTEND-002 — Attendee controller requires authentication

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | /attendees | Yes | ADMIN, EDITOR | Create attendee |
| GET | /attendees | Yes | Any | List attendees |
| GET | /attendees/:id | Yes | Any | Get attendee by ID |
| PUT | /attendees/:id | Yes | ADMIN, EDITOR | Update attendee |
| DELETE | /attendees/:id | Yes | ADMIN | Delete attendee |

## Registration Endpoints

VERIFY: EM-REG-001 — Registration service checks event capacity before confirming
VERIFY: EM-REG-002 — Registration service implements waitlist logic

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | /registrations | Yes | ADMIN, EDITOR | Create registration |
| GET | /registrations | Yes | Any | List registrations |
| GET | /registrations/:id | Yes | Any | Get registration by ID |
| PUT | /registrations/:id | Yes | ADMIN | Update registration status |
| DELETE | /registrations/:id | Yes | ADMIN | Cancel registration |

Registration creation checks:
1. Event exists and is PUBLISHED
2. Attendee exists
3. No duplicate registration (unique constraint)
4. If capacity reached, status = WAITLISTED instead of CONFIRMED

See: edge-cases.md for capacity and waitlist edge cases
See: data-model.md for unique constraint

## Dashboard and Data Source Endpoints

These are placeholder endpoints for cross-layer integration testing:

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /dashboards | Yes | List dashboards |
| GET | /data-sources | Yes | List data sources |

See: cross-layer.md for integration testing
