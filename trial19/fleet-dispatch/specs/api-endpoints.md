# API Endpoints Specification

## Overview

Fleet Dispatch exposes RESTful CRUD endpoints for Vehicles, Drivers, Routes, and Dispatches. All domain endpoints require JWT authentication and filter data by tenantId from the token payload. List endpoints use pagination with MAX_PAGE_SIZE clamping.

## Vehicle Endpoints

- GET /vehicles — List vehicles for tenant (paginated)
- GET /vehicles/:id — Get vehicle by ID (tenant-scoped)
- POST /vehicles — Create vehicle (tenant-scoped)
- PATCH /vehicles/:id — Update vehicle (tenant-scoped)
- DELETE /vehicles/:id — Delete vehicle (ADMIN only)

<!-- VERIFY: FD-VEH-001 — VehicleService implements tenant-scoped CRUD with pagination -->
<!-- VERIFY: FD-VEH-002 — VehicleController requires JWT auth and ADMIN role for delete -->

## Driver Endpoints

- GET /drivers — List drivers for tenant (paginated)
- GET /drivers/:id — Get driver by ID (tenant-scoped)
- POST /drivers — Create driver (tenant-scoped)
- PATCH /drivers/:id — Update driver (tenant-scoped)
- DELETE /drivers/:id — Delete driver (ADMIN only)

<!-- VERIFY: FD-DRV-001 — DriverService implements tenant-scoped CRUD with pagination -->
<!-- VERIFY: FD-DRV-002 — DriverController requires JWT auth and ADMIN role for delete -->

## Route Endpoints

- GET /routes — List routes for tenant (paginated)
- GET /routes/:id — Get route by ID (tenant-scoped)
- POST /routes — Create route (tenant-scoped)
- PATCH /routes/:id — Update route (tenant-scoped)
- DELETE /routes/:id — Delete route (ADMIN only)

<!-- VERIFY: FD-ROUTE-001 — RouteService implements tenant-scoped CRUD with pagination -->
<!-- VERIFY: FD-ROUTE-002 — RouteController requires JWT auth and ADMIN role for delete -->

## Dispatch Endpoints

- GET /dispatches — List dispatches for tenant (paginated)
- GET /dispatches/:id — Get dispatch by ID (tenant-scoped)
- POST /dispatches — Create dispatch (tenant-scoped)
- PATCH /dispatches/:id — Update dispatch (tenant-scoped)
- DELETE /dispatches/:id — Delete dispatch (ADMIN only)

<!-- VERIFY: FD-DISP-001 — DispatchService implements tenant-scoped CRUD with pagination -->
<!-- VERIFY: FD-DISP-002 — DispatchController requires JWT auth and ADMIN role for delete -->
