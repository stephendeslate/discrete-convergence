# API Layer Specification

> **Cross-references:** See [authentication.md](authentication.md), [data-model.md](data-model.md), [security.md](security.md), [monitoring.md](monitoring.md)

## Overview

The Fleet Dispatch API layer implements RESTful controllers following NestJS conventions.
Each domain entity (customers, work orders, technicians, invoices, routes) has a dedicated
controller with standard HTTP methods (GET, POST, PATCH, DELETE) and consistent response
patterns including pagination and cache headers.

## Controllers

### Customers Controller
- VERIFY:FD-API-001 — RESTful controller with standard HTTP methods (GET, POST, PATCH, DELETE)
- Routes: POST /customers, GET /customers, GET /customers/:id, PATCH /customers/:id, DELETE /customers/:id
- Cache-Control: private, max-age=30 on list endpoint
- Multi-tenant isolation via companyId extracted from JWT

### Work Orders Controller
- VERIFY:FD-API-002 — Work orders controller with CRUD + status transitions
- Routes: POST, GET, GET/:id, PATCH/:id, PATCH/:id/status, DELETE/:id
- Cache-Control: no-store on list endpoint (real-time data)
- Status transition endpoint validates against 9-state machine

### Work Order DTOs
- VERIFY:FD-API-003 — Work order DTO with class-validator decorators
- CreateWorkOrderDto: title (required), description, priority (enum), scheduledAt, technicianId, customerId
- UpdateWorkOrderDto: all fields optional
- Validated by global ValidationPipe with whitelist and forbidNonWhitelisted

### Technicians Service
- VERIFY:FD-API-004 — Technicians CRUD service with GPS position updates
- Position update endpoint: PATCH /technicians/:id/position
- GPS coordinates stored as Decimal(10,7) via Prisma.Decimal
- Skills stored as string array

### Invoices Controller
- VERIFY:FD-API-005 — Invoices controller with CRUD + status transitions
- Routes: POST, GET, GET/:id, PATCH/:id/status, DELETE/:id
- Only DRAFT invoices can be deleted
- Line items created in transaction with invoice

## Request/Response Patterns

All list endpoints return paginated responses: `{ data, total, page, pageSize }`.
Pagination is bounded by clampPagination from @fleet-dispatch/shared (MAX_PAGE_SIZE=100).

All endpoints extract companyId from JWT payload via `req.user.companyId`.
No per-controller @UseGuards — authentication is handled by global APP_GUARD.

## Error Handling

All controllers delegate error handling to the GlobalExceptionFilter (APP_FILTER).
Service methods throw NestJS exceptions (NotFoundException, BadRequestException)
which the filter catches and transforms into consistent error responses.

## Cross-References

- Authentication: see auth.md (FD-AUTH-*)
- State machines: see data-model.md (FD-DM-002, FD-DM-003)
- Pagination performance: see performance.md (FD-PERF-003)
- Error filtering: see monitoring.md (FD-MON-005)
