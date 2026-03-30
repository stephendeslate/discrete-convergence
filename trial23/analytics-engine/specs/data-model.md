# Data Model Specification

> **Project:** Analytics Engine
> **Category:** DATA
> **Related:** See [api-endpoints.md](api-endpoints.md) for CRUD operations on these entities, see [infrastructure.md](infrastructure.md) for migrations and Docker setup

---

## Overview

The analytics engine data model supports multi-tenant analytics with dashboards, widgets, data sources, and ingested data points. All entities are tenant-scoped via `tenantId` foreign key with Row Level Security enforced at the database level. Monetary fields use `Decimal(12,2)` — never Float. The Prisma schema defines all models, enums, indexes, and relations.

---

## Requirements

### VERIFY: AE-DATA-001 — All models use @@map('snake_case')

Every Prisma model uses `@@map('snake_case_table_name')` to ensure database table names follow PostgreSQL snake_case conventions. For example, `model DataSource { ... @@map('data_sources') }` and `model SyncHistory { ... @@map('sync_histories') }`. Field names in the Prisma schema use camelCase, but the underlying database columns use snake_case via `@map('snake_case')` where needed. This convention applies to ALL models without exception: Tenant, User, Dashboard, Widget, DataSource, SyncHistory, DataPoint, ApiKey, EmbedConfig, and AuditLog.

### VERIFY: AE-DATA-002 — Monetary fields use Decimal @db.Decimal(12,2)

All monetary fields (billing amounts, pricing tiers, cost values) use `Decimal @db.Decimal(12, 2)` in the Prisma schema. The `Float` type is never used for money. The `Decimal` type ensures exact decimal arithmetic without floating-point rounding errors. Any widget configuration that references monetary values stores them as JSON with string-encoded decimals. The DataPoint model uses `Json` for flexible metrics that may contain decimal values, but dedicated monetary columns always use the Decimal type.

### VERIFY: AE-DATA-003 — @@index on tenantId, status, composite (tenantId, status)

Every model with a `tenantId` field has `@@index([tenantId])` for efficient tenant-scoped queries. Models with status fields have `@@index([status])` for status-based filtering. Composite indexes `@@index([tenantId, status])` exist on Dashboard, DataSource, and SyncHistory for queries that filter by both tenant and status simultaneously. The User model has a `@@unique([email])` constraint. These indexes ensure query performance at scale when filtering by tenant isolation boundaries.

### VERIFY: AE-DATA-004 — RLS ENABLE + FORCE + CREATE POLICY for every table

The database migration includes `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` and `ALTER TABLE ... FORCE ROW LEVEL SECURITY` for all tenant-scoped tables. Each table has a `CREATE POLICY` statement that restricts row access based on `current_setting('app.current_tenant_id')`. The application sets the tenant context via `SET LOCAL app.current_tenant_id` before executing queries. This ensures data isolation even if application-level filtering is bypassed. RLS policies use `USING (tenant_id = current_setting('app.current_tenant_id')::uuid)` for SELECT and `WITH CHECK` for INSERT/UPDATE.

### VERIFY: AE-DATA-005 — User email is unique

The User model defines email as a unique field using `@unique` in the Prisma schema. This creates a unique index on the `email` column at the database level. Attempting to register with an existing email returns a 409 Conflict error from the auth service. The unique constraint is enforced at the database layer, not just application validation, to prevent race conditions. Email addresses are stored in lowercase and trimmed of whitespace before persistence.

### VERIFY: AE-DATA-006 — SyncHistory tracks run status with error messages

The SyncHistory model (mapped to `sync_histories` table) records each data source synchronization run. Fields include `id`, `dataSourceId`, `status` (SyncStatus enum: IDLE, RUNNING, COMPLETED, FAILED), `startedAt`, `completedAt`, `recordCount`, `errorMessage` (nullable String for failure details), and `tenantId`. When a sync fails, the service sets status to FAILED and writes the error message to `errorMessage`. The seed file includes at least one SyncHistory record with FAILED status and a non-null error message for testing error display.

---

## Entity Summary

| Entity | Key Fields | Status Enum |
|--------|-----------|-------------|
| Tenant | name, tier, domain | TenantTier: FREE, PRO, ENTERPRISE |
| User | email, passwordHash, role, tenantId | UserRole: ADMIN, EDITOR, VIEWER |
| Dashboard | title, description, status, tenantId | DashboardStatus: DRAFT, PUBLISHED, ARCHIVED |
| Widget | type, config, dashboardId, position | WidgetType: LINE, BAR, PIE, AREA, KPI, TABLE |
| DataSource | name, type, connectionConfig, tenantId | DataSourceType: REST_API, POSTGRESQL, CSV, WEBHOOK |
| SyncHistory | status, startedAt, completedAt, errorMessage | SyncStatus: IDLE, RUNNING, COMPLETED, FAILED |
| DataPoint | dimensions, metrics, sourceHash, timestamp | — |
| EmbedConfig | allowedOrigins, enabled, tenantId | — |
| ApiKey | keyHash, prefix, type, tenantId | ApiKeyType: ADMIN, EMBED |
| AuditLog | action, entityType, entityId, tenantId | — |

---

## Enum Definitions

All Prisma enums use `@@map('snake_case_enum_name')` for PostgreSQL naming:

- `UserRole`: ADMIN, EDITOR, VIEWER
- `DashboardStatus`: DRAFT, PUBLISHED, ARCHIVED
- `DataSourceType`: REST_API, POSTGRESQL, CSV, WEBHOOK
- `SyncStatus`: IDLE, RUNNING, COMPLETED, FAILED
- `WidgetType`: LINE, BAR, PIE, AREA, KPI, TABLE
- `TenantTier`: FREE, PRO, ENTERPRISE
