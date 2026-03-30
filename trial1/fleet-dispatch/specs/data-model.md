# Data Model Specification

> **Cross-references:** See [authentication.md](authentication.md), [api-endpoints.md](api-endpoints.md), [infrastructure.md](infrastructure.md), [security.md](security.md)

## Overview

Fleet Dispatch uses Prisma 6 with PostgreSQL 16. The schema defines 13 models
with 6 enums, all using @@map for snake_case table names and @map for column names.
Row Level Security (RLS) is enabled and forced on all tables.

## Prisma Schema

### Schema Conventions
- VERIFY:FD-DM-001 — Prisma schema with @@map on all models and enums loaded via PrismaClient
- All models use @@map("snake_case_table_name")
- All enums use @@map("snake_case_enum_name") and @map("snake_case_value")
- Primary keys: UUID via @id @default(uuid())
- Timestamps: createdAt @default(now()), updatedAt @updatedAt
- All companyId fields indexed for multi-tenant query performance

### Work Order State Machine
- VERIFY:FD-DM-002 — Work order 9-state machine with valid transitions
- States: UNASSIGNED, ASSIGNED, EN_ROUTE, ON_SITE, IN_PROGRESS, COMPLETED, INVOICED, PAID, CANCELLED
- Forward path: UNASSIGNED → ASSIGNED → EN_ROUTE → ON_SITE → IN_PROGRESS → COMPLETED → INVOICED → PAID
- CANCELLED allowed from any state except PAID (terminal)
- PAID and CANCELLED are terminal states (no outgoing transitions)
- completedAt timestamp set on COMPLETED transition
- Status update uses $transaction for atomicity

### Invoice State Machine
- VERIFY:FD-DM-003 — Invoice state machine: DRAFT → SENT → PAID, VOID from DRAFT/SENT
- DRAFT → SENT (sets sentAt), SENT → PAID (sets paidAt)
- VOID from DRAFT or SENT only
- PAID and VOID are terminal states

### Monetary Fields
- VERIFY:FD-DM-004 — Decimal(12,2) monetary fields via Prisma.Decimal
- Invoice: subtotal, tax, totalAmount — all @db.Decimal(12, 2)
- LineItem: unitPrice, total — all @db.Decimal(12, 2)
- Route: totalDistance — @db.Decimal(12, 2)
- NEVER Float for monetary values

### Row Level Security
- VERIFY:FD-DM-005 — RLS enforcement via $executeRaw with Prisma.sql
- Migration enables RLS: ALTER TABLE ... ENABLE ROW LEVEL SECURITY
- Migration forces RLS: ALTER TABLE ... FORCE ROW LEVEL SECURITY
- Applied to all 13 tables
- TechniciansService.verifyRls() checks current_setting('app.current_company_id')
- Uses Prisma.sql template tag (not $executeRawUnsafe)

## Models Summary

| Model | Table | Key Relations |
|-------|-------|--------------|
| Company | companies | Root entity, owns all other entities |
| User | users | Belongs to Company, unique on (email, companyId) |
| Technician | technicians | GPS (Decimal 10,7), skills array, work orders |
| Customer | customers | Work orders, invoices |
| WorkOrder | work_orders | 9-state machine, technician, customer, photos |
| Invoice | invoices | 4-state machine, line items, work order (1:1) |
| LineItem | line_items | Belongs to Invoice, Decimal monetary fields |
| Route | routes | Date-based, technician, route stops |
| RouteStop | route_stops | Ordered stops linking routes to work orders |
| Photo | photos | Belongs to WorkOrder |
| AuditLog | audit_logs | Before/after JSON, entity tracking |
| Notification | notifications | Type enum, belongs to User + Company |
| Setting | settings | Key-value per company |

## Cross-References

- API endpoints for state transitions: see api-layer.md (FD-API-002, FD-API-005)
- Performance testing of pagination: see performance.md (FD-PERF-003)
