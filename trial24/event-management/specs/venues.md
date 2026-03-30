# Venues Specification

## Overview

Venues represent physical locations where events take place. Each venue has a
name, address, and capacity. Venues are organization-scoped via RLS.
See [events.md](events.md) for how venues link to events.

## Module Structure

<!-- VERIFY:VENUE-MODULE -->
The `VenueModule` registers the venue service and controller, importing
PrismaModule for database access. It is imported by AppModule.

<!-- VERIFY:VENUE-CONTROLLER -->
The `VenueController` maps HTTP methods to service operations:
- `POST /venues` — Create venue (EDITOR or ADMIN)
- `GET /venues` — List venues (paginated, tenant-scoped)
- `GET /venues/:id` — Get venue by ID
- `PATCH /venues/:id` — Update venue (EDITOR or ADMIN)
- `DELETE /venues/:id` — Delete venue (ADMIN only)

<!-- VERIFY:VENUE-SERVICE -->
The `VenueService` implements CRUD operations for venues with organization
scoping. It supports pagination and validates capacity as a positive integer.

<!-- VERIFY:VENUE-DTO -->
Venue DTOs define validation: name (required, max 200), address (required),
capacity (required, positive integer). class-validator decorators enforce.

## Test Coverage

<!-- VERIFY:VENUE-SERVICE-SPEC -->
Unit tests for VenueService cover creation, listing with pagination, get by
ID, update, deletion, and organization scoping.

<!-- VERIFY:TEST-VENUE-INTEGRATION -->
Integration tests verify the full HTTP lifecycle for venue CRUD including
authentication requirements, role authorization, and validation errors.

## Business Rules

- Name is required, max 200 characters
- Address is required
- Capacity must be a positive integer
- All queries scoped by organizationId
- Only ADMIN can delete venues

## Cross-References

- Events hosted at venues: see [events.md](events.md)
- Security and RLS: see [security.md](security.md)
- Data model: see [data-model.md](data-model.md)
