# Data Model Specification

## Overview

Fleet Dispatch uses PostgreSQL 16 with Prisma ORM for data access.
All monetary values use Decimal(12,2). GPS coordinates use Decimal(10,7).
See [api-endpoints.md](api-endpoints.md) for endpoint specifications.

## Entities

### Company
Tenant entity with name and slug. All other entities belong to a company.

### User
Authenticated user with role enum (ADMIN, DISPATCHER, TECHNICIAN, CUSTOMER).
Email is unique per company (composite unique constraint).

### Technician
1:1 with User. Tracks skills[], GPS position, availability.
<!-- VERIFY:FD-TECH-001 — TechnicianService provides CRUD with tenant scoping -->
<!-- VERIFY:FD-TECH-002 — TechnicianController exposes CRUD with Cache-Control -->

### Customer
1:1 with User. Stores contact info and geocoded address.
<!-- VERIFY:FD-CUST-001 — CustomerService provides CRUD with tenant scoping -->
<!-- VERIFY:FD-CUST-002 — CustomerController exposes CRUD with Cache-Control -->

### WorkOrder
Central entity. 9-state machine with priority levels.
<!-- VERIFY:FD-WO-001 — WorkOrderService implements CRUD with state machine validation -->
<!-- VERIFY:FD-WO-002 — WorkOrderService.updateStatus validates state transitions -->
<!-- VERIFY:FD-WO-003 — WorkOrderController exposes CRUD + status update endpoints -->

### Route
Daily optimized route for a technician with total distance/duration.
<!-- VERIFY:FD-ROUTE-001 — RouteService creates routes with ordered stops in transaction -->
<!-- VERIFY:FD-ROUTE-002 — RouteController exposes CRUD for routes -->

### Invoice
Generated from work order. States: DRAFT, SENT, PAID, VOID.
<!-- VERIFY:FD-INV-001 — InvoiceService creates invoices with line items in transaction -->
<!-- VERIFY:FD-INV-002 — InvoiceService.updateStatus validates invoice state transitions -->
<!-- VERIFY:FD-INV-003 — InvoiceController exposes CRUD + send/pay/void endpoints -->

### Supporting Entities
- WorkOrderStatusHistory: Immutable audit trail
- RouteStop: Position in route with ETA
- JobPhoto: Photo metadata from on-site
- LineItem: Invoice line entries (labor, material, flat_rate, discount, tax)
- Notification: Lifecycle event messages
- AuditLog: Compliance audit trail

## Indexing Strategy

- @@index on all companyId (tenantId) foreign keys
- @@index on status fields
- @@index on composite (companyId, status) for filtered queries
- @@index on composite (companyId, date) for route lookups

## Row Level Security

<!-- VERIFY:FD-DA-001 — AuditLogService uses $executeRaw for RLS-aware purge operations -->

All tables have RLS enabled (ENABLE ROW LEVEL SECURITY + FORCE ROW LEVEL SECURITY).

## Naming Conventions

- All models: @@map('snake_case_table_name')
- All enums: @@map('snake_case_enum_name') with @map on values
- All fields: @map('snake_case_column_name') where needed
