# API Endpoints Specification

## Overview

The Event Management API is a RESTful NestJS 11 application providing
endpoints for authentication, event management, venue management,
registration, and monitoring. All endpoints except those marked `@Public()`
require JWT authentication.

## Endpoint Inventory

### Authentication

<!-- VERIFY:EM-API-001 — Auth endpoints (login, register, refresh) are public -->

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/login | Public | Authenticate and return JWT |
| POST | /auth/register | Public | Create account and return JWT |
| POST | /auth/refresh | Public | Refresh JWT token |

### Events

<!-- VERIFY:EM-API-002 — Events CRUD with publish/cancel endpoints -->

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /events | Required | Create new event |
| GET | /events | Required | List events (paginated) |
| GET | /events/:id | Required | Get event details |
| PATCH | /events/:id | Required | Update event |
| DELETE | /events/:id | Required | Delete event |
| PATCH | /events/:id/publish | Required | Publish event |
| PATCH | /events/:id/cancel | Required | Cancel event |

### Venues

<!-- VERIFY:EM-API-003 — Venue service with full CRUD operations -->

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /venues | Required | Create venue |
| GET | /venues | Required | List venues (paginated) |
| GET | /venues/:id | Required | Get venue details |
| PATCH | /venues/:id | Required | Update venue |
| DELETE | /venues/:id | Required | Delete venue |

### Registrations

<!-- VERIFY:EM-API-004 — Registration endpoints for register, list, cancel -->

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /events/:id/register | Required | Register for event |
| GET | /events/:id/registrations | Required | List registrations |
| PATCH | /registrations/:id/cancel | Required | Cancel registration |

## Request Validation

- All DTO string fields have `@IsString()` + `@MaxLength()`
- All UUID fields have `@MaxLength(36)`
- Email fields have `@IsEmail()` + `@IsString()` + `@MaxLength()`
- Registration role field uses `@IsIn(ALLOWED_REGISTRATION_ROLES)`
- `ValidationPipe` enforces `whitelist`, `forbidNonWhitelisted`, `transform`

## Pagination

- List endpoints accept `page` and `pageSize` query parameters
- Pagination is clamped (not rejected) using `clampPagination` from shared
- Default page size: 20, maximum page size: 100
- Response format: `{ items, total, page, pageSize }`

## Response Headers

- `X-Response-Time`: Response time in milliseconds
- `X-Correlation-ID`: Request correlation identifier
- `Cache-Control`: Set on list endpoints for caching
