# API Endpoints Specification

## Overview

Fleet Dispatch API is built with NestJS and exposes RESTful endpoints for
vehicles, drivers, dispatches, routes, authentication, and monitoring.
All domain endpoints require JWT authentication. Admin-only operations
require the ADMIN role via @Roles decorator.

## Requirements

### Vehicle Endpoints

- VERIFY: FD-VEH-001
  GET /vehicles returns paginated list of vehicles scoped to tenant.
  Response includes Cache-Control header for client-side caching.

- VERIFY: FD-VEH-002
  POST /vehicles creates a new vehicle with validated input.
  Required fields: licensePlate, make, model, year.

- VERIFY: FD-VEH-003
  PATCH /vehicles/:id updates vehicle fields scoped to tenant.
  Only provided fields are updated (partial update).

- VERIFY: FD-VEH-004
  DELETE /vehicles/:id is restricted to ADMIN role via @Roles('ADMIN').
  Returns 403 if non-admin user attempts deletion.

### Driver Endpoints

- VERIFY: FD-DRV-001
  GET /drivers returns paginated list of drivers scoped to tenant.

- VERIFY: FD-DRV-002
  POST /drivers creates a new driver with validated input.
  Required fields: name, licenseNumber, phone.

- VERIFY: FD-DRV-003
  PATCH /drivers/:id updates driver fields scoped to tenant.

- VERIFY: FD-DRV-004
  DELETE /drivers/:id is restricted to ADMIN role.

### Dispatch Endpoints

- VERIFY: FD-DSP-001
  GET /dispatches returns paginated list of dispatches scoped to tenant.

- VERIFY: FD-DSP-002
  POST /dispatches creates a new dispatch with validated input.
  Required fields: reference, pickupAddress, deliveryAddress.

- VERIFY: FD-DSP-003
  PATCH /dispatches/:id updates dispatch fields including status transitions.

- VERIFY: FD-DSP-004
  DELETE /dispatches/:id is restricted to ADMIN role.

### Route Endpoints

- VERIFY: FD-RTE-001
  GET /routes returns paginated list of routes scoped to tenant.

- VERIFY: FD-RTE-002
  POST /routes creates a new route with validated input.
  Required fields: name, distance, estimatedTime.

- VERIFY: FD-RTE-003
  PATCH /routes/:id updates route fields scoped to tenant.

- VERIFY: FD-RTE-004
  DELETE /routes/:id is restricted to ADMIN role.

### Pagination

- VERIFY: FD-SHARED-002
  All list endpoints support page and pageSize query parameters.
  Page size is clamped to MAX_PAGE_SIZE from shared package.
  Default page size is DEFAULT_PAGE_SIZE from shared package.

## Cross-References

- See [authentication.md](authentication.md) for auth endpoints
- See [security.md](security.md) for guard and validation configuration
- See [data-model.md](data-model.md) for entity schemas
