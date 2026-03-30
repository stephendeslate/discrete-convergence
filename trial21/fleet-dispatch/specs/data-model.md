# Data Model Specification

## Overview
Fleet Dispatch uses PostgreSQL with Prisma ORM. All business entities are company-scoped
via tenantId (TEXT, no ::uuid cast) for row-level security.

## Entity Relationship Diagram
Company → Users, Technicians, Customers, WorkOrders, Invoices, Routes, AuditLogs
WorkOrder → StatusHistory, Photos, Invoice, RouteStops
Invoice → LineItems
Route → RouteStops
Technician → WorkOrders, RouteStops, GpsReadings

## Core Entities

### Company (Tenant)
- id: UUID PK
- name, address, phone, email
- woSequence, invSequence (auto-incrementing counters)
- @@map("companies")

### User
- id: UUID PK, email (unique), passwordHash, firstName, lastName
- role: ADMIN | DISPATCHER | TECHNICIAN | CUSTOMER
- companyId FK, tenantId TEXT — VERIFY: FD-COMP-001
- @@index([companyId]), @@index([tenantId]), @@index([email])
- @@map("users")

### Technician
- id, firstName, lastName, email, phone, skills[]
- latitude/longitude: Decimal(10,7) — VERIFY: FD-GPS-001
- gpsUpdatedAt, isActive, companyId, tenantId
- @@map("technicians")

### Customer
- id, name, email, phone, address
- latitude/longitude: Decimal(10,7) (geocoded)
- magicToken, tokenExpiry (for customer portal)
- @@map("customers")

### WorkOrder
- id, sequenceNumber (WO-NNNNN), title, description
- status: UNASSIGNED → ASSIGNED → EN_ROUTE → ON_SITE → IN_PROGRESS → COMPLETED → INVOICED → PAID
- CANCELLED from any except PAID — VERIFY: FD-WO-001
- priority (1-5), scheduledDate, completedDate
- trackingToken (UUID, 24h expiry) — VERIFY: FD-TRACK-001
- @@map("work_orders")

### Invoice
- id, sequenceNumber (INV-NNNNN), workOrderId (unique)
- status: DRAFT → SENT → PAID, VOID from DRAFT/SENT
- subtotal, tax, total: Decimal(12,2) — VERIFY: FD-INV-001
- Immutable after SENT — VERIFY: FD-INV-002
- @@map("invoices")

### LineItem
- type: LABOR | MATERIAL | FLAT_RATE | DISCOUNT | TAX
- quantity, unitPrice, total: Decimal(12,2)
- @@map("line_items")

### GpsReading
- technicianId, latitude, longitude: Decimal(10,7)
- 90-day retention policy
- Batch inserts via $executeRaw
- @@map("gps_readings")

## Database Conventions
- All tables use @@map for snake_case table names
- All fields use @map for snake_case column names
- @@index on frequently queried columns
- No cascading deletes on business data
- Monetary fields: @db.Decimal(12,2)
- GPS coordinates: @db.Decimal(10,7)

## Cross-References
- See [authentication.md](authentication.md) for User auth flow
- See [api-endpoints.md](api-endpoints.md) for CRUD operations
- See [security.md](security.md) for tenant isolation
