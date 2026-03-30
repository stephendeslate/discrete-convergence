# API Endpoints Specification

## Overview

The Event Management API provides RESTful endpoints for managing events, venues, tickets,
attendees, and schedules. All domain endpoints require JWT authentication and enforce
multi-tenant isolation.

## Auth Endpoints

VERIFY: EM-API-001 — Auth controller with public register and login endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/register | Public | Register new user |
| POST | /auth/login | Public | Authenticate and get JWT |

## Event Endpoints

VERIFY: EM-API-002 — Event controller with full CRUD, tenant-scoped, with Cache-Control on list

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /events | JWT | Create event |
| GET | /events | JWT | List events (paginated, Cache-Control) |
| GET | /events/:id | JWT | Get event by ID |
| PUT | /events/:id | JWT | Update event |
| DELETE | /events/:id | JWT | Delete event |

## Venue Endpoints

VERIFY: EM-API-003 — Venue controller with full CRUD, tenant-scoped, with Cache-Control on list

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /venues | JWT | Create venue |
| GET | /venues | JWT | List venues (paginated) |
| GET | /venues/:id | JWT | Get venue by ID |
| PUT | /venues/:id | JWT | Update venue |
| DELETE | /venues/:id | JWT | Delete venue |

## Ticket Endpoints

VERIFY: EM-API-004 — Ticket controller with CRUD, admin-only delete via @Roles decorator

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /tickets | JWT | Create ticket |
| GET | /tickets | JWT | List tickets (paginated) |
| GET | /tickets/:id | JWT | Get ticket by ID |
| PUT | /tickets/:id | JWT | Update ticket |
| DELETE | /tickets/:id | JWT + ADMIN | Delete ticket (admin only) |

## Attendee Endpoints

VERIFY: EM-API-005 — Attendee controller with create, list, read, delete; duplicate registration returns 409

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /attendees | JWT | Register attendee |
| GET | /attendees | JWT | List attendees (paginated) |
| GET | /attendees/:id | JWT | Get attendee by ID |
| DELETE | /attendees/:id | JWT | Remove attendee |

## Schedule Endpoints

VERIFY: EM-API-006 — Schedule controller with full CRUD, tenant-scoped

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /schedules | JWT | Create schedule item |
| GET | /schedules | JWT | List schedules (paginated) |
| GET | /schedules/:id | JWT | Get schedule by ID |
| PUT | /schedules/:id | JWT | Update schedule |
| DELETE | /schedules/:id | JWT | Delete schedule |

## Monitoring Endpoints

See [monitoring.md](monitoring.md) for health, ready, and metrics endpoints.

## Pagination

All list endpoints support `page` and `pageSize` query parameters.
Page size is clamped to MAX_PAGE_SIZE (100), defaulting to DEFAULT_PAGE_SIZE (20).
