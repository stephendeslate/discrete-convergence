# Data Model Specification

> **Project:** Analytics Engine
> **Category:** DATA
> **Related:** See [api-endpoints.md](api-endpoints.md) for CRUD operations on these entities, see [infrastructure.md](infrastructure.md) for migrations and RLS

---

## Overview

The analytics engine data model supports multi-tenant analytics with dashboards, widgets, data sources, and ingested data points. All entities are tenant-scoped via `tenantId` foreign key with Row Level Security enforced at the database level. Monetary fields use `Decimal(12,2)` — never Float.

---

## Requirements

### VERIFY:AE-DATA-001 — Prisma schema with @@map on all models

Every Prisma model uses `@@map('snake_case_table_name')` to ensure database table names follow PostgreSQL conventions. All fields use appropriate types: `String` for text, `Int` for counts, `Decimal @db.Decimal(12,2)` for monetary values, `DateTime` for timestamps, and `Json` for flexible data.

### VERIFY:AE-DATA-002 — Enum mapping with @@map and @map

All Prisma enums use `@@map('snake_case_enum_name')` and each enum value uses `@map('UPPER_SNAKE_VALUE')` to maintain consistent naming between Prisma and PostgreSQL. Enums include `UserRole`, `DashboardStatus`, `DataSourceType`, `SyncStatus`, `WidgetType`, and `TenantTier`.

### VERIFY:AE-DATA-003 — Indexes on tenantId, status, and composites

Every model with a `tenantId` field has `@@index([tenantId])`. Models with status fields have `@@index([status])`. Composite indexes `@@index([tenantId, status])` exist on Dashboard, DataSource, and SyncRun for efficient filtered queries.

### VERIFY:AE-DATA-004 — Decimal for monetary fields

All monetary fields (widget prices, tenant billing amounts, line items) use `Decimal @db.Decimal(12, 2)`. The Float type is never used for money. The DataPoint model uses `Json` for flexible metrics that may contain decimal values.

### VERIFY:AE-DATA-005 — Row Level Security in migrations

The initial migration includes `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` and `ALTER TABLE ... FORCE ROW LEVEL SECURITY` for all tenant-scoped tables. RLS policies enforce that rows are only visible to users with matching `tenantId` set via `SET LOCAL app.current_tenant_id`.

### VERIFY:AE-DATA-006 — executeRaw for RLS with Prisma.sql

At least one service file uses `$executeRaw(Prisma.sql\`...\`)` to set the tenant context before queries. This is the mechanism by which RLS policies are activated at the application level. The `$executeRawUnsafe` method is never used anywhere in the codebase.

### VERIFY:AE-DATA-007 — Multi-tenant entity relationships

The Tenant model is the root entity. Users belong to a Tenant. Dashboards, DataSources, Widgets, SyncRuns, DataPoints, ApiKeys, EmbedConfigs, and AuditLogs all reference a Tenant via `tenantId`. Cascade deletes are disabled for business data — only junction tables and ephemeral records cascade.

### VERIFY:AE-DATA-008 — Seed with error handling and shared imports

The seed file (`prisma/seed.ts`) imports `BCRYPT_SALT_ROUNDS` from the shared package for password hashing. It includes a `main()` function with `disconnect()` in finally, `console.error` + `process.exit(1)` error handling, and seeds at least one error/failure state record (e.g., a FAILED SyncRun).

---

## Entity Summary

| Entity | Key Fields | Status Enum |
|--------|-----------|-------------|
| Tenant | name, tier, domain | TenantTier: FREE, PRO, ENTERPRISE |
| User | email, passwordHash, role, tenantId | UserRole: ADMIN, EDITOR, VIEWER |
| Dashboard | title, description, status, tenantId | DashboardStatus: DRAFT, PUBLISHED, ARCHIVED |
| Widget | type, config, dashboardId | WidgetType: LINE, BAR, PIE, AREA, KPI, TABLE, FUNNEL |
| DataSource | name, type, tenantId | DataSourceType: REST_API, POSTGRESQL, CSV, WEBHOOK |
| SyncRun | status, startedAt, completedAt | SyncStatus: IDLE, RUNNING, COMPLETED, FAILED |
| DataPoint | dimensions, metrics, sourceHash | — |
| EmbedConfig | allowedOrigins, enabled | — |
| ApiKey | keyHash, prefix, type | ApiKeyType: ADMIN, EMBED |
| AuditLog | action, entityType, entityId | — |
