# Routes Specification

## Overview

CRUD operations for fleet routes. Routes define paths between origin and
destination with distance and estimated time. See [dispatches.md](dispatches.md)
for how routes are used in dispatches.

## Module Structure

<!-- VERIFY:API-ROUTE-MODULE -->
The `RouteModule` registers the route service and controller, importing
PrismaModule for database access. It is imported by AppModule.

<!-- VERIFY:API-ROUTE-CONTROLLER -->
The `RouteController` maps HTTP methods to service operations:
- `GET /routes` — List routes (paginated, company-scoped)
- `GET /routes/:id` — Get route by ID
- `POST /routes` — Create route (EDITOR or ADMIN)
- `PATCH /routes/:id` — Update route (EDITOR or ADMIN)
- `DELETE /routes/:id` — Delete route (ADMIN only)

<!-- VERIFY:API-ROUTE-SERVICE -->
The `RouteService` implements CRUD operations for routes with company
scoping. It supports pagination and validates distance/time constraints.

<!-- VERIFY:API-ROUTE-DTO -->
Route DTOs define validation: name (required), origin (required), destination
(required), distanceKm (positive decimal), estimatedMinutes (positive integer).

## Test Coverage

<!-- VERIFY:API-ROUTE-SERVICE-SPEC -->
Unit tests for RouteService cover creation, listing with pagination,
distance/time validation, and company scoping.

## Business Rules

- Name is required
- Origin and destination are required strings
- distanceKm must be a positive decimal
- estimatedMinutes must be a positive integer
- All queries scoped by companyId
- Only ADMIN can delete routes

## Cross-References

- Dispatches using routes: see [dispatches.md](dispatches.md)
- Security and RLS: see [security.md](security.md)
- Data model: see [data-model.md](data-model.md)
