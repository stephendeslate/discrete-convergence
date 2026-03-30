# API Endpoints Specification

## Overview

Fleet Dispatch provides RESTful API endpoints for managing work orders, technicians,
customers, routes, and invoices. All domain endpoints require JWT authentication via
the global APP_GUARD. Pagination uses clamping (never rejection).

## Requirements

### VERIFY:FD-API-001 — WorkOrderService CRUD operations

The WorkOrderService must provide: create, findAll (paginated), findOne (by id + companyId),
update, remove, updateStatus (with state machine validation), and assign operations.
All operations must scope queries by companyId for tenant isolation.

### VERIFY:FD-API-002 — WorkOrder controller with CRUD + status + assign endpoints

The WorkOrderController must expose: POST /work-orders, GET /work-orders, GET /work-orders/:id,
PATCH /work-orders/:id, DELETE /work-orders/:id, PATCH /work-orders/:id/status,
POST /work-orders/:id/assign. Cache-Control header on list endpoint.

### VERIFY:FD-API-003 — TechnicianService CRUD with N+1 prevention

The TechnicianService must provide CRUD operations with Prisma `include` for eager loading
related entities (user, workOrders). Queries must be scoped by companyId.
findAvailable returns technicians with available=true.

### VERIFY:FD-API-004 — CustomerService CRUD with tenant scoping

The CustomerService must provide CRUD operations scoped by companyId. All queries
must filter by companyId to enforce tenant isolation. Pagination via clampPagination.

### VERIFY:FD-API-005 — DTO validation with class-validator decorators

All DTO string fields must have @IsString() + @MaxLength(). UUID fields must have
@MaxLength(36). Email fields must have @IsEmail() + @IsString() + @MaxLength().
Enum fields must use @IsIn() with shared constants.

### VERIFY:FD-API-006 — RouteService with optimization and CRUD

The RouteService must provide: findAll (paginated), findOne (scoped by companyId),
optimize (create route with ordered stops), and remove. Routes include nested stops
with work order details, ordered by stopOrder.

### VERIFY:FD-API-007 — Work order integration tests with real AppModule

Integration tests must use supertest with real AppModule compilation. Tests must verify:
unauthenticated request rejection, missing field validation, invalid input handling.

## Pagination

All list endpoints use clamping pagination:
- MAX_PAGE_SIZE: 100 (from shared)
- DEFAULT_PAGE_SIZE: 20 (from shared)
- Invalid page/pageSize values are clamped to valid range, never rejected

## Response Format

List endpoints return: `{ data: T[], total: number, page: number, pageSize: number }`
Single item endpoints return the entity directly.
Error responses include: `{ statusCode, message, correlationId, timestamp }`

## Related Specifications

- See [authentication.md](authentication.md) for auth requirements
- See [data-model.md](data-model.md) for entity schemas
