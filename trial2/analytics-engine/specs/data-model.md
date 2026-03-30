# Data Model Specification

## Overview

The Analytics Engine data model supports multi-tenant analytics with data source
ingestion, dashboard composition, and embed configuration. All models use PostgreSQL
with Prisma ORM and follow strict naming conventions.

## Entity Relationships

```
Tenant 1──* User
Tenant 1──* Dashboard
Tenant 1──* DataSource
Tenant 1──* ApiKey
Tenant 1──* AuditLog

Dashboard 1──* Widget
Dashboard 1──1 EmbedConfig

DataSource 1──1 DataSourceConfig
DataSource 1──* FieldMapping
DataSource 1──* SyncRun
DataSource 1──* DataPoint
DataSource 1──* AggregatedDataPoint
DataSource 1──* QueryCache
DataSource 1──* Widget (optional FK)
```

## Requirements

<!-- VERIFY:AE-DATA-001 — Prisma service with lifecycle hooks for connect/disconnect -->
- REQ-DATA-001: PrismaService must implement OnModuleInit and OnModuleDestroy

<!-- VERIFY:AE-DATA-002 — All models use @@map with snake_case table names -->
- REQ-DATA-002: Every model must have `@@map('snake_case_table_name')`
- Every enum must have `@@map('snake_case_enum_name')` with `@map` on values

<!-- VERIFY:AE-DATA-003 — Monetary fields use Decimal @db.Decimal(12, 2), never Float -->
- REQ-DATA-003: All monetary fields must use `Decimal @db.Decimal(12, 2)`
- The `cost` field on QueryCache is the monetary field in this schema

<!-- VERIFY:AE-DATA-004 — @@index on tenantId FKs, status fields, and composite (tenantId, status) -->
- REQ-DATA-004: Indexes must exist on:
  - All `tenantId` foreign key columns
  - All `status` columns
  - Composite indexes on (tenantId, status) where applicable
  - Additional indexes on frequently queried fields (email, queryHash, sourceHash)

## Naming Conventions

- Tables: snake_case via `@@map` (e.g., `data_sources`, `sync_runs`)
- Columns: snake_case via `@map` (e.g., `tenant_id`, `created_at`)
- Enums: snake_case type name via `@@map`, snake_case values via `@map`

## Row Level Security

See [security.md](security.md) for RLS requirements.

- All tables must have `ENABLE ROW LEVEL SECURITY` and `FORCE ROW LEVEL SECURITY`
- RLS is applied in the migration SQL, not in the Prisma schema

## Key Design Decisions

- UUIDs for all primary keys (TEXT type in Prisma)
- JSONB for flexible data (dimensions, metrics, config, details, theme)
- Timestamps with Prisma `@default(now())` and `@updatedAt`
- Soft delete is NOT used — dashboards use status transitions instead
- DataSourceConfig stores encrypted credentials — never logged, never in API responses
- sourceHash on DataPoint enables idempotent sync

## Enum Definitions

- TenantTier: FREE, PRO, ENTERPRISE
- UserRole: ADMIN, USER, VIEWER
- DashboardStatus: DRAFT, PUBLISHED, ARCHIVED
- WidgetType: LINE_CHART, BAR_CHART, PIE_CHART, AREA_CHART, KPI_CARD, TABLE, FUNNEL
- DataSourceType: REST_API, POSTGRESQL, CSV, WEBHOOK
- SyncStatus: IDLE, RUNNING, COMPLETED, FAILED
- ApiKeyType: ADMIN, EMBED
