# API Endpoints Specification

## Overview

Fleet Dispatch exposes a RESTful API built on NestJS 11.
All domain endpoints require JWT authentication via the global APP_GUARD.
Public endpoints are decorated with @Public(). See [authentication.md](authentication.md)
for auth flow details and [data-model.md](data-model.md) for entity schemas.

## Work Order Endpoints

### VERIFY:FD-WO-003 — Work Order Controller CRUD
WorkOrderController must implement:
- POST /work-orders — create work order (requires companyId from JWT)
- GET /work-orders — list work orders with pagination and Cache-Control header
- GET /work-orders/:id — get single work order with includes
- PATCH /work-orders/:id — update work order fields
- DELETE /work-orders/:id — delete work order
- PATCH /work-orders/:id/status — update status with state machine validation
- POST /work-orders/:id/assign — assign technician

### VERIFY:FD-WO-004 — Work Order Service Unit Tests
WorkOrderService must have unit tests with mocked Prisma covering:
- create, findOne, findAll, update, remove
- updateStatus with valid and invalid transitions
- assign with valid and invalid states

## Technician Endpoints

### VERIFY:FD-TECH-001 — Technician Service CRUD
TechnicianService must implement create, findAll, findOne, update, remove,
findAvailable (filtered by isAvailable=true), and getSchedule
(filtered by active statuses).

### VERIFY:FD-TECH-002 — Technician Controller Routes
TechnicianController must expose:
- POST /technicians — create
- GET /technicians — list with pagination and Cache-Control
- GET /technicians/available — available technicians
- GET /technicians/:id — get single
- GET /technicians/:id/schedule — get schedule
- PATCH /technicians/:id — update
- DELETE /technicians/:id — delete

## Invoice Endpoints

### VERIFY:FD-INV-002 — Invoice Send Operation
InvoiceService.send() must validate that the invoice is in DRAFT status
before transitioning to SENT. Must set issuedAt timestamp.
Invoices in PAID or VOID status cannot be sent.

### VERIFY:FD-INV-003 — Invoice Controller Routes
InvoiceController must expose:
- POST /invoices/work-orders/:workOrderId — create invoice for work order
- GET /invoices — list with pagination and Cache-Control
- GET /invoices/:id — get single
- PATCH /invoices/:id/send — send invoice
- DELETE /invoices/:id — delete (only DRAFT)

### VERIFY:FD-INV-004 — Invoice Service Unit Tests
InvoiceService must have unit tests with mocked Prisma covering:
- create, findOne, findAll, send, remove
- Status transition validation (DRAFT → SENT allowed, PAID → SENT rejected)
- Only DRAFT invoices can be deleted

## Customer Endpoints

### VERIFY:FD-CUST-001 — Customer Service CRUD
CustomerService must implement create, findAll, findOne, update, remove
with multi-tenant filtering by companyId.

### VERIFY:FD-CUST-002 — Customer Controller Routes
CustomerController must expose CRUD endpoints:
- POST /customers, GET /customers, GET /customers/:id
- GET /customers/:id/work-orders — customer's work orders
- PATCH /customers/:id, DELETE /customers/:id

## Pagination

All list endpoints must use clampPagination from shared package.
Page size is clamped (not rejected) to MAX_PAGE_SIZE (100).

### VERIFY:FD-PERF-003 — Paginated Response Format
Paginated responses must include meta object with page, pageSize, total, totalPages.
