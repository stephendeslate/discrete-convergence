# API Endpoints Specification

## Overview

The event management API provides RESTful endpoints for managing events, venues,
attendees, and registrations. All domain endpoints require JWT authentication and
extract tenant context from the JWT payload for multi-tenant isolation.

## Auth Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/register | Public | Register new user |
| POST | /auth/login | Public | Authenticate and get JWT |

## Event Endpoints

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | /events | JWT | Any | List events (paginated) |
| GET | /events/:id | JWT | Any | Get event by ID |
| POST | /events | JWT | ADMIN | Create event |
| PUT | /events/:id | JWT | ADMIN | Update event |
| DELETE | /events/:id | JWT | ADMIN | Delete event |

- VERIFY: EM-EVENT-001 — EventService provides CRUD with tenant-scoped queries
- VERIFY: EM-EVENT-002 — EventController uses @Req() for tenant extraction, @Roles for RBAC

## Venue Endpoints

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | /venues | JWT | Any | List venues (paginated) |
| GET | /venues/:id | JWT | Any | Get venue by ID |
| POST | /venues | JWT | ADMIN | Create venue |
| PUT | /venues/:id | JWT | ADMIN | Update venue |
| DELETE | /venues/:id | JWT | ADMIN | Delete venue |

- VERIFY: EM-VENUE-001 — VenueService provides CRUD with tenant-scoped queries
- VERIFY: EM-VENUE-002 — VenueController uses @Req() for tenant extraction

## Attendee Endpoints

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | /attendees | JWT | Any | List attendees (paginated) |
| GET | /attendees/:id | JWT | Any | Get attendee by ID |
| POST | /attendees | JWT | Any | Create attendee |
| PUT | /attendees/:id | JWT | Any | Update attendee |
| DELETE | /attendees/:id | JWT | Any | Delete attendee |

- VERIFY: EM-ATTENDEE-001 — AttendeeService provides CRUD with tenant-scoped queries
- VERIFY: EM-ATTENDEE-002 — AttendeeController uses @Req() for tenant extraction

## Registration Endpoints

| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| GET | /registrations | JWT | Any | List registrations (paginated) |
| GET | /registrations/:id | JWT | Any | Get registration by ID |
| POST | /registrations | JWT | Any | Create registration |
| PUT | /registrations/:id | JWT | Any | Update registration |
| DELETE | /registrations/:id | JWT | Any | Delete registration |

- VERIFY: EM-REG-001 — RegistrationService provides CRUD with tenant-scoped queries
- VERIFY: EM-REG-002 — RegistrationController uses @Req() for tenant extraction

## Cross-References

- See [authentication.md](authentication.md) for auth flow details
- See [data-model.md](data-model.md) for entity schema definitions
- See [security.md](security.md) for guard and validation configuration
