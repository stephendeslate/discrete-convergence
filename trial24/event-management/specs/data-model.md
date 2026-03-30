# Data Model Specification

## Overview

The Event Management data model is defined in Prisma schema and consists of
seven domain entities plus the User entity. All entities include an
organizationId field for multi-tenant isolation via PostgreSQL RLS.

## Shared Package

<!-- VERIFY:SHARED-INDEX -->
The shared package (`@em/shared`) exports common types, constants, and
utilities used by both the API and web packages. The index file re-exports
all public modules.

<!-- VERIFY:SHARED-INDEX-SPEC -->
Unit tests verify that all shared exports are correctly re-exported from
the index file and that types are properly defined.

<!-- VERIFY:SHARED-CORRELATION -->
The correlation module provides utilities for generating and propagating
X-Correlation-ID values across service boundaries.

<!-- VERIFY:SHARED-ENV-VALIDATION -->
Environment validation utilities ensure required environment variables
(DATABASE_URL, JWT_SECRET, etc.) are present at startup with correct types.

<!-- VERIFY:SHARED-LOG-SANITIZER -->
The log sanitizer strips sensitive fields (password, token, authorization)
from log context objects before they are written to output.

<!-- VERIFY:SHARED-PAGINATION -->
Shared pagination types define the standard response shape for paginated
list endpoints: { data, meta: { page, pageSize, total } }.

## Core Entities

### User
- Fields: id (UUID), email, passwordHash, name, role (enum), organizationId
- Role enum: ADMIN, EDITOR, VIEWER
- Unique: email per organization

### Event
- Fields: id, title, description, startDate, endDate, status (enum), venueId, organizationId
- Status enum: DRAFT, PUBLISHED, CANCELLED
- Relations: has many Sessions, Tickets, Attendees; belongs to Venue

### Venue
- Fields: id, name, address, capacity (Int), organizationId
- Relations: has many Events

### Session
- Fields: id, title, description, startTime, endTime, eventId, speakerId, organizationId
- Relations: belongs to Event, optionally belongs to Speaker

### Speaker
- Fields: id, name, email, bio, organizationId
- Relations: has many Sessions

### Ticket
- Fields: id, type, price (Decimal), quantity (Int), eventId, organizationId
- Relations: belongs to Event, has many Attendees

### Attendee
- Fields: id, name, email, ticketId, eventId, organizationId
- Relations: belongs to Ticket, belongs to Event

## Cross-References

- Prisma module: see [security.md](security.md)
- Entity endpoints: see [api-endpoints.md](api-endpoints.md)
- Tenant isolation: see [security.md](security.md)
