# Data Model Specification

## Overview

Fleet Dispatch uses PostgreSQL 16 with Prisma ORM for data persistence.
The data model implements multi-tenant isolation through companyId foreign keys
and Row Level Security (RLS) policies. See [api-endpoints.md](api-endpoints.md)
for endpoint specifications and [security.md](security.md) for RLS details.

## Entity Relationship Summary

- Company 1:N User, Technician, Customer, WorkOrder, Route, Invoice, AuditLog, Notification
- User 1:1 Technician (optional)
- Customer 1:N WorkOrder
- Technician 1:N WorkOrder, Route
- WorkOrder 1:N WorkOrderStatusHistory, RouteStop, JobPhoto
- WorkOrder 1:1 Invoice (optional)
- Route 1:N RouteStop
- Invoice 1:N LineItem

## Requirements

### VERIFY:FD-DATA-001 — Raw SQL Execution
At least one service must use $executeRaw(Prisma.sql`...`) for a query that
benefits from raw SQL (aggregation, complex joins, or tenant-scoped counts).
Zero $executeRawUnsafe calls permitted anywhere in the codebase.

### VERIFY:FD-WO-001 — Work Order Status State Machine
The WorkOrderService must enforce valid status transitions.
Valid transitions:
- UNASSIGNED → ASSIGNED, CANCELLED
- ASSIGNED → EN_ROUTE, UNASSIGNED, CANCELLED
- EN_ROUTE → ON_SITE, CANCELLED
- ON_SITE → IN_PROGRESS, CANCELLED
- IN_PROGRESS → COMPLETED, CANCELLED
- COMPLETED → INVOICED, CANCELLED
- INVOICED → PAID, CANCELLED
- PAID → (none)
- CANCELLED → (none)
Invalid transitions must return 400 Bad Request.

### VERIFY:FD-WO-002 — Status Transition with History
Status updates must create a WorkOrderStatusHistory record with
fromStatus, toStatus, changedBy, and optional note. The update must
be wrapped in a Prisma transaction.

### VERIFY:FD-INV-001 — Invoice Status Machine
InvoiceService must enforce invoice status transitions:
- DRAFT → SENT, VOID
- SENT → PAID, VOID
- PAID → (none)
- VOID → (none)

## Naming Conventions

All models use @@map('snake_case_table_name').
All enums use @@map('snake_case_enum_name') with @map('snake_case_value') on values.
All fields with multi-word names use @map('snake_case_field_name').

## Indexing Strategy

- @@index on all companyId foreign keys (tenant isolation queries)
- @@index on status fields (work_orders.status, invoices.status)
- Composite @@index on (companyId, status) for filtered tenant queries
- @@index on foreign keys: technicianId, customerId, workOrderId, routeId, invoiceId

## Monetary Fields

All monetary fields use Decimal @db.Decimal(12, 2):
- Invoice: subtotal, tax, total
- LineItem: quantity, unitPrice, total
- Route: totalDistance
- RouteStop: legDistance

## GPS Coordinates

GPS coordinates use Decimal @db.Decimal(10, 7):
- Technician: latitude, longitude
- Customer: latitude, longitude
