# Trips Specification

## Overview

Trip records capture actual travel data for a dispatch including distance,
fuel usage, and timing. Each trip references a dispatch within the same company.
See [dispatches.md](dispatches.md) for the parent dispatch entity.

## Module Structure

<!-- VERIFY:API-TRIP-MODULE -->
The `TripModule` registers the trip service and controller, importing
PrismaModule for database access. It is imported by AppModule.

<!-- VERIFY:API-TRIP-CONTROLLER -->
The `TripController` maps HTTP methods to service operations:
- `GET /trips` — List trips (paginated, company-scoped)
- `GET /trips/:id` — Get trip with dispatch relation
- `POST /trips` — Create trip (EDITOR or ADMIN)
- `PATCH /trips/:id` — Update trip (EDITOR or ADMIN)

Trips are not deletable, only updatable.

<!-- VERIFY:API-TRIP-SERVICE -->
The `TripService` implements CRUD operations for trips with company scoping.
It validates that referenced dispatches exist within the same company and
enforces timing constraints (completedAt > startedAt).

<!-- VERIFY:API-TRIP-DTO -->
Trip DTOs define validation: dispatchId (required UUID), startedAt (required
ISO date), completedAt (optional, must be after startedAt), distanceKm
(optional non-negative decimal), fuelUsedLiters (optional non-negative decimal),
notes (optional string).

## Business Rules

- Each trip must reference an existing dispatch in the same company
- completedAt must be after startedAt when provided
- distanceKm and fuelUsedLiters are optional (may be filled later)
- Notes field supports free-text for driver observations
- Trips are not deletable, only updatable
- All queries scoped by companyId

## Cross-References

- Parent dispatch: see [dispatches.md](dispatches.md)
- Vehicle details: see [vehicles.md](vehicles.md)
- Driver details: see [drivers.md](drivers.md)

<!-- VERIFY:TRIP-SERVICE-SPEC -->
