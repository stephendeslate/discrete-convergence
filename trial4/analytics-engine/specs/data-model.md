# Data Model Specification

## Overview

The Analytics Engine data model supports multi-tenant analytics with
data source connectors, dashboards, widgets, and aggregated data points.
All entities are tenant-scoped via tenantId foreign keys with Row Level Security.

See [security.md](security.md) for RLS policy details.
See [api-endpoints.md](api-endpoints.md) for CRUD endpoint mappings.

## Core Entities

### Tenant
- id (UUID), name, tier (FREE/PRO/ENTERPRISE), theme (JSON), timestamps
- Parent entity for all tenant-scoped data

### User
- id (UUID), email (unique), passwordHash, role (ADMIN/USER/VIEWER)
- Belongs to Tenant via tenantId FK

### Dashboard
- id (UUID), title, status (DRAFT/PUBLISHED/ARCHIVED), tenantId FK
- Has many Widgets, optional EmbedConfig

### Widget
- id (UUID), title, type (LINE_CHART/BAR_CHART/PIE_CHART/AREA_CHART/KPI_CARD/TABLE/FUNNEL)
- config (JSON), position (JSON), dashboardId FK, optional dataSourceId FK

### DataSource
- id (UUID), name, type (REST_API/POSTGRESQL/CSV/WEBHOOK)
- configEncrypted (encrypted credentials), scheduleMinutes, failureCount, paused
- tenantId FK, has many SyncRuns and FieldMappings

### SyncRun
- id (UUID), status (IDLE/RUNNING/COMPLETED/FAILED), rowsIngested, errorMessage
- dataSourceId FK

## Requirements

### VERIFY:AE-DAT-001
All models MUST use @@map('snake_case_table_name') for PostgreSQL naming.
All enums MUST use @@map('snake_case_enum_name') with @map on values.

### VERIFY:AE-DAT-002
All tenantId foreign keys MUST have @@index. Status fields MUST have @@index.
Composite indexes on (tenantId, status) where applicable.

### VERIFY:AE-DAT-003
Widget count per dashboard MUST be capped at MAX_WIDGETS_PER_DASHBOARD
from shared. Enforcement in widget service create method.

### VERIFY:AE-DAT-004
All tables with tenant data MUST have ENABLE ROW LEVEL SECURITY and
FORCE ROW LEVEL SECURITY in the migration.

### VERIFY:AE-DAT-005
configEncrypted on DataSource MUST never appear in API responses,
logs, or query cache. It is encrypted at rest.

### VERIFY:AE-DAT-006
At least one service MUST use $executeRaw(Prisma.sql`...`) for raw SQL.
Zero $executeRawUnsafe calls allowed anywhere.

## Indexing Strategy

- Primary keys: UUID with @id @default(uuid())
- Foreign keys: @@index on all tenantId columns
- Status fields: @@index on status columns
- Composite: @@index([tenantId, status]) for filtered tenant queries
- Unique: @@unique([dataSourceId, sourceHash]) for idempotent ingestion

## Enum Mapping

All enums use snake_case mapping:
- Role: admin, user, viewer
- TenantTier: free, pro, enterprise
- DashboardStatus: draft, published, archived
- WidgetType: line_chart, bar_chart, pie_chart, area_chart, kpi_card, table, funnel
- ConnectorType: rest_api, postgresql, csv, webhook
- SyncStatus: idle, running, completed, failed
