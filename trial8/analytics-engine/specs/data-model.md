# Data Model Specification

> **Project:** Analytics Engine
> **Category:** DATA
> **Related:** See [authentication.md](authentication.md) for User entity, see [api-endpoints.md](api-endpoints.md) for CRUD operations

---

## Overview

The analytics engine uses Prisma ORM with PostgreSQL 16. The schema defines five core entities: Tenant, User, Dashboard, Widget, and DataSource. All tables use snake_case naming via `@@map` and `@map`. Row Level Security (RLS) is enabled on all tenant-scoped tables.

---

## Requirements

### VERIFY:AE-DATA-001 — Snake_case table mapping

All Prisma models use `@@map("snake_case_table_name")` for PostgreSQL table names. All fields use `@map("snake_case")` where the Prisma field name differs from the column name (e.g., `tenantId` maps to `tenant_id`, `passwordHash` maps to `password_hash`, `createdAt` maps to `created_at`). Enums use both `@@map` and `@map` for enum type and value names.

### VERIFY:AE-DATA-002 — Enum mapping conventions

All Prisma enums use `@@map("snake_case")` for the PostgreSQL enum type name and `@map("VALUE")` for each enum value. Enums: `UserRole` (ADMIN/USER/ANALYST), `DashboardStatus` (DRAFT/PUBLISHED/ARCHIVED), `WidgetType` (CHART/TABLE/METRIC/MAP), `DataSourceType` (POSTGRES/API/CSV), `DataSourceStatus` (ACTIVE/INACTIVE/ERROR).

### VERIFY:AE-DATA-003 — Composite and single-column indexes

Models have indexes on frequently queried fields: `User` has `@@index([tenantId])`, `@@index([email])`, `@@index([tenantId, role])`. `Dashboard` has `@@index([tenantId])`, `@@index([status])`, `@@index([tenantId, status])`. `Widget` has `@@index([dashboardId])`. `DataSource` has `@@index([tenantId])`, `@@index([status])`, `@@index([tenantId, status])`.

### VERIFY:AE-DATA-004 — Decimal for monetary fields

All monetary values use `Decimal` type, never `Float`. Widget config and DataSource connection details use `Json` type for flexible structured data with `@default("{}")`.

### VERIFY:AE-DATA-005 — Migration with RLS policies

The initial migration SQL includes `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`, `ALTER TABLE ... FORCE ROW LEVEL SECURITY`, and `CREATE POLICY` statements for all tenant-scoped tables (users, dashboards, widgets, data_sources). Policies restrict access based on `current_setting('app.current_tenant_id')`.

### VERIFY:AE-DATA-006 — RLS tenant context via executeRaw

Services set the tenant context before queries using `$executeRaw` with `Prisma.sql` tagged template literal: `Prisma.sql\`SELECT set_config('app.current_tenant_id', ${tenantId}, true)\``. Never uses `$executeRawUnsafe`. This ensures Row Level Security policies are enforced at the database level.

### VERIFY:AE-DATA-007 — Multi-tenant entity relationships

All domain entities (Dashboard, Widget, DataSource) belong to a Tenant via `tenantId` foreign key. The User entity also has a `tenantId` field. Queries in services always scope by `tenantId` at the application level in addition to database-level RLS enforcement.

### VERIFY:AE-DATA-008 — Seed data with error states

The Prisma seed script creates initial data including error state records: a DataSource with `ERROR` status and a Dashboard with `ARCHIVED` status. Seed uses `BCRYPT_SALT_ROUNDS` from shared for password hashing. The seed script includes `main()` + `disconnect` pattern with `console.error` + `process.exit(1)` error handling.

---

## Entity Relationships

```
Tenant 1:N User
Tenant 1:N Dashboard
Tenant 1:N DataSource
Dashboard 1:N Widget
```
