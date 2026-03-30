# Data Model Specification

## Overview

Fleet Dispatch uses PostgreSQL 16 with Prisma 6 ORM. The schema supports multi-tenant
data isolation via Row Level Security (RLS), uses Decimal types for monetary and GPS
values, and includes comprehensive indexes for query performance.

## Requirements

### VERIFY:FD-DAT-001 — PrismaService for database access

A PrismaService extending PrismaClient must be provided as an injectable NestJS service.
It must implement OnModuleInit (connect) and OnModuleDestroy (disconnect) lifecycle hooks.

### VERIFY:FD-DAT-002 — Work order status machine validation

The WorkOrderService must validate status transitions against a predefined state machine:
UNASSIGNED -> ASSIGNED -> EN_ROUTE -> ON_SITE -> IN_PROGRESS -> COMPLETED -> INVOICED -> PAID.
CANCELLED is reachable from any state except PAID. Invalid transitions must return 400.

### VERIFY:FD-DAT-004 — Invoice status machine with Decimal amounts

InvoiceService must validate status transitions: DRAFT -> SENT -> PAID, VOID from DRAFT or SENT.
All monetary amounts (totalAmount, quantity, unitPrice, amount) must use Decimal @db.Decimal(12,2).
No Float types for money.

### VERIFY:FD-DAT-006 — $executeRaw for RLS context setting

At least one service must use $executeRaw(Prisma.sql`...`) for setting the RLS context
(app.current_company_id). This ensures tenant isolation at the database level. Zero
$executeRawUnsafe calls anywhere in the codebase.

## Schema Design

All models use `@@map('snake_case_table_name')`.
All enums use `@@map('snake_case_enum_name')` with `@map('snake_case_value')` on values.
GPS coordinates use Decimal(10,7) for latitude and longitude.
Monetary values use Decimal(12,2) for amounts and prices.

## Indexes

- `@@index([companyId])` on all tenant-scoped models
- `@@index([status])` on WorkOrder, Invoice
- `@@index([companyId, status])` composite indexes on WorkOrder, Invoice
- `@@index([technicianId])` on WorkOrder
- `@@index([companyId, available])` on Technician

## Row Level Security

All tenant-scoped tables have RLS enabled:
- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
- `ALTER TABLE ... FORCE ROW LEVEL SECURITY`

## Related Specifications

- See [api-endpoints.md](api-endpoints.md) for service operations
- See [authentication.md](authentication.md) for user model
- See [infrastructure.md](infrastructure.md) for migrations and seed
