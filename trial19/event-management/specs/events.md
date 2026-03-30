# Events Domain Specification

## Overview

Event management is the core domain of the platform. Events represent
gatherings, conferences, or meetings that attendees can register for.

## Event Model

- Fields: id (UUID), title, description, status, startDate, endDate,
  venueId (FK), tenantId, createdAt, updatedAt
- Status enum: DRAFT, PUBLISHED, CANCELLED
- Belongs to Venue, has many Registrations

## Event CRUD Operations

- Create: requires ADMIN role, validates required fields
- Read (list): paginated with clampPagination, filtered by tenantId
- Read (single): by ID with tenantId filter
- Update: requires ADMIN role, 404 if not found
- Delete: requires ADMIN role, 404 if not found
- VERIFY: EM-EVENT-001 — Event service implements full CRUD with tenant isolation
- VERIFY: EM-EVENT-002 — Event controller applies @Roles('ADMIN') on create/update/delete

## Caching

- GET /events sets Cache-Control: public, max-age=60

## Venue Domain

- Venues represent physical locations for events
- Fields: id, name, address, capacity, tenantId, createdAt, updatedAt
- CRUD operations follow same pattern as events
- VERIFY: EM-VENUE-001 — Venue service implements CRUD with tenant isolation
- VERIFY: EM-VENUE-002 — Venue controller applies @Roles('ADMIN') on mutations

## Attendee Domain

- Attendees represent people who can register for events
- Fields: id, name, email, tenantId, createdAt, updatedAt
- CRUD operations follow same pattern as events
- VERIFY: EM-ATTENDEE-001 — Attendee service implements CRUD with tenant isolation
- VERIFY: EM-ATTENDEE-002 — Attendee controller applies @Roles('ADMIN') on mutations

## Registration Domain

- Registrations link attendees to events
- Fields: id, eventId (FK), attendeeId (FK), status, tenantId, createdAt, updatedAt
- Status enum: PENDING, CONFIRMED, CANCELLED
- VERIFY: EM-REG-001 — Registration service implements CRUD with tenant isolation
- VERIFY: EM-REG-002 — Registration controller exposes paginated endpoints
