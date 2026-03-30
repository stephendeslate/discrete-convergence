# API Endpoints Specification

> **Project:** Event Management
> **Category:** API
> **Related:** See [authentication.md](authentication.md) for auth endpoints, see [data-model.md](data-model.md) for entity definitions

---

## Overview

The event management REST API is built with NestJS 11 and provides CRUD operations for events, venues, tickets, and registrations. All endpoints are protected by global JWT auth guard except those decorated with `@Public()`. DTOs use class-validator decorators for input validation.

---

## Requirements

### VERIFY:EM-API-001 — Event CRUD controller

The EventController provides full CRUD endpoints: `POST /events` (create), `GET /events` (list with pagination), `GET /events/:id` (find one), `PATCH /events/:id` (update with status transitions), `DELETE /events/:id` (delete). Create and update require ORGANIZER or ADMIN role via `@Roles()` decorator.

### VERIFY:EM-API-002 — Venue CRUD controller

The VenueController provides CRUD endpoints: `POST /venues`, `GET /venues`, `GET /venues/:id`, `PATCH /venues/:id`, `DELETE /venues/:id`. Venue creation requires ORGANIZER or ADMIN role. Capacity is validated as a positive integer.

### VERIFY:EM-API-003 — Ticket CRUD controller

The TicketController provides CRUD endpoints: `POST /tickets`, `GET /tickets`, `GET /tickets/:id`, `PATCH /tickets/:id`, `DELETE /tickets/:id`. Ticket creation validates that the referenced event exists and is not CANCELLED. Price uses Decimal type.

### VERIFY:EM-API-004 — DTO validation with class-validator

All DTOs use class-validator decorators: `@IsString()` + `@MaxLength()` on string fields, `@MaxLength(36)` on UUID fields, `@IsEmail()` + `@IsString()` + `@MaxLength()` on email fields. The global `ValidationPipe` is configured with `whitelist`, `forbidNonWhitelisted`, and `transform` options.

### VERIFY:EM-API-005 — Pagination clamping with shared constants

List endpoints use `clampPagination` from the shared package which clamps `page` to minimum 1 and `limit` to a range of 1-MAX_PAGE_SIZE (100). Invalid values are clamped, not rejected. DEFAULT_PAGE_SIZE (20) is used when no limit is provided.

### VERIFY:EM-API-006 — Cache-Control on list endpoints

All controller methods that return lists (`findAll` / list endpoints) set `Cache-Control` headers on the response. The header value is `public, max-age=60` for published data and `private, no-cache` for draft/tenant-specific data.

### VERIFY:EM-API-007 — Registration CRUD controller

The RegistrationController provides CRUD endpoints for managing event registrations. Registration creation validates that the ticket is AVAILABLE and the event is PUBLISHED. All operations are tenant-scoped.

---

## Endpoint Summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/register | Public | Register new user |
| POST | /auth/login | Public | Login, returns JWT |
| POST | /auth/refresh | Public | Refresh token |
| GET | /events | JWT | List events (paginated) |
| POST | /events | JWT+ORGANIZER | Create event |
| GET | /events/:id | JWT | Get event by ID |
| PATCH | /events/:id | JWT+ORGANIZER | Update event |
| DELETE | /events/:id | JWT+ORGANIZER | Delete event |
| GET | /venues | JWT | List venues |
| POST | /venues | JWT+ORGANIZER | Create venue |
| GET | /venues/:id | JWT | Get venue by ID |
| PATCH | /venues/:id | JWT+ORGANIZER | Update venue |
| DELETE | /venues/:id | JWT+ORGANIZER | Delete venue |
| GET | /tickets | JWT | List tickets |
| POST | /tickets | JWT+ORGANIZER | Create ticket |
| PATCH | /tickets/:id | JWT+ORGANIZER | Update ticket |
| DELETE | /tickets/:id | JWT+ORGANIZER | Delete ticket |
| POST | /registrations | JWT | Create registration |
| GET | /registrations | JWT | List registrations |
| DELETE | /registrations/:id | JWT | Cancel registration |
| GET | /health | Public | Health check |
| GET | /health/ready | Public | Readiness check |
| GET | /metrics | JWT | App metrics |
