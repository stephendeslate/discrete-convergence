# Maintenance Specification

## Overview

Track vehicle maintenance records including routine service, repairs, and
inspections with cost tracking. Each record links to a vehicle within the
same company. See [vehicles.md](vehicles.md) for the vehicle entity.

## Module Structure

<!-- VERIFY:API-MAINTENANCE-MODULE -->
The `MaintenanceModule` registers the maintenance service and controller,
importing PrismaModule for database access. It is imported by AppModule.

<!-- VERIFY:API-MAINTENANCE-CONTROLLER -->
The `MaintenanceController` maps HTTP methods to service operations:
- `GET /maintenance` — List records (paginated, company-scoped)
- `GET /maintenance/:id` — Get record with vehicle relation
- `POST /maintenance` — Create record (EDITOR or ADMIN)
- `PATCH /maintenance/:id` — Update record (EDITOR or ADMIN)
- `DELETE /maintenance/:id` — Delete record (ADMIN only)

<!-- VERIFY:API-MAINTENANCE-SERVICE -->
The `MaintenanceService` implements CRUD operations for maintenance records
with company scoping. It validates that referenced vehicles exist within
the same company and supports filtering by type and vehicleId.

<!-- VERIFY:API-MAINTENANCE-DTO -->
Maintenance DTOs define validation: vehicleId (required UUID), type
(required enum: ROUTINE, REPAIR, INSPECTION), description (required),
scheduledDate (required ISO date), completedDate (optional), cost
(optional non-negative decimal).

## Business Rules

- Vehicle must exist and belong to same company
- completedDate must be after scheduledDate if provided
- Cost must be non-negative decimal
- Type must be ROUTINE, REPAIR, or INSPECTION
- All queries scoped by companyId
- Only ADMIN can delete records

## Cross-References

- Vehicle entity: see [vehicles.md](vehicles.md)
- Security and RLS: see [security.md](security.md)
- Data model: see [data-model.md](data-model.md)

<!-- VERIFY:MAINTENANCE-SERVICE-SPEC -->
