# API Endpoints Specification

> **Project:** Event Management
> **Domain:** API
> **VERIFY Tags:** EM-API-001 – EM-API-006

---

## Overview

RESTful CRUD endpoints organized by domain module. All endpoints are
tenant-scoped via organizationId extracted from the JWT payload. Pagination
uses `clampPagination()` from the shared package with MAX_PAGE_SIZE=100.

---

## Requirements

### EM-API-001: Event CRUD with Organization Scoping

<!-- VERIFY: EM-API-001 -->

- GET /events — list events for the authenticated user's organization.
- GET /events/:id — retrieve a single event by ID.
- POST /events — create a new event (ORGANIZER, ADMIN roles).
- PATCH /events/:id — update event details.
- DELETE /events/:id — soft-delete or remove an event.
- PATCH /events/:id/publish — transition event to PUBLISHED status.
- PATCH /events/:id/cancel — transition event to CANCELLED status.
- All queries filtered by organizationId for tenant isolation.

### EM-API-002: Venue CRUD with Organization Scoping

<!-- VERIFY: EM-API-002 -->

- GET /venues — list venues for the organization.
- GET /venues/:id — retrieve a single venue.
- POST /venues — create a new venue with name and capacity.
- PATCH /venues/:id — update venue details.
- DELETE /venues/:id — remove a venue.
- Capacity is stored as an integer (minimum 1).

### EM-API-003: Registration Management

<!-- VERIFY: EM-API-003 -->

- POST /events/:id/register — register an attendee for an event.
- GET /events/:id/registrations — list registrations for an event.
- PATCH /registrations/:id/cancel — cancel a registration.
- Registration includes attendee name, email, and ticket type selection.
- Status transitions: PENDING → CONFIRMED → CHECKED_IN or CANCELLED.

### EM-API-004: Pagination via clampPagination

<!-- VERIFY: EM-API-004 -->

- All list endpoints accept `page` and `limit` query parameters.
- `clampPagination()` from `@repo/shared` normalizes parameters.
- Default page size: 20 (DEFAULT_PAGE_SIZE).
- Maximum page size: 100 (MAX_PAGE_SIZE).
- Response format: `{ data, total, page, limit }`.

### EM-API-005: Dashboard CRUD with Organization Scoping

<!-- VERIFY: EM-API-005 -->

- GET /dashboards — list dashboards for the organization.
- GET /dashboards/:id — retrieve a single dashboard.
- POST /dashboards — create a new analytics dashboard.
- PATCH /dashboards/:id — update dashboard configuration.
- DELETE /dashboards/:id — remove a dashboard.
- Dashboards support DRAFT, PUBLISHED, and ARCHIVED statuses.

### EM-API-006: DataSource CRUD with Sync and History

<!-- VERIFY: EM-API-006 -->

- GET /data-sources — list data sources for the organization.
- GET /data-sources/:id — retrieve a single data source.
- POST /data-sources — create a new data source connection.
- PATCH /data-sources/:id — update data source configuration.
- DELETE /data-sources/:id — remove a data source.
- POST /data-sources/:id/sync — trigger a synchronization.
- GET /data-sources/:id/sync-history — view sync history with status.
