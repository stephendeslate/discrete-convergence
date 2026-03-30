# Data Model Specification

## Overview

The Analytics Engine data model supports multi-tenant analytics dashboards with widgets,
data sources, and metrics. All models use Prisma ORM with PostgreSQL.

See also: [Security Specification](security.md) for RLS policy details.

## Entity Definitions

### User
- Fields: id (UUID), email (unique), password, name, role (UserRole enum), tenantId, timestamps
- VERIFY: AE-DATA-001 — Seed data creates admin, regular, and error-state (locked) users

### Dashboard
- Fields: id (UUID), title, description (optional), status (DashboardStatus enum), tenantId, createdById (FK→User), timestamps
- Relations: belongsTo User (createdBy), hasMany Widget
- VERIFY: AE-DASH-001 — DashboardService provides CRUD with tenant scoping and pagination

### Widget
- Fields: id (UUID), title, type (WidgetType enum), config (JSON string), dashboardId (FK→Dashboard), dataSourceId (FK→DataSource, optional), tenantId, position, timestamps
- Relations: belongsTo Dashboard, belongsTo DataSource (optional)
- VERIFY: AE-WIDG-001 — WidgetService provides CRUD with tenant scoping

### DataSource
- Fields: id (UUID), name, type (DataSourceType enum), connectionString (optional), config (JSON string), tenantId, timestamps
- Relations: hasMany Widget
- VERIFY: AE-DS-001 — DataSourceService provides CRUD with tenant scoping

### Metric
- Fields: id (UUID), name, value (Decimal @db.Decimal(12,2)), unit (optional), tenantId, dashboardId (optional), timestamps
- VERIFY: AE-DATA-002 — Health readiness endpoint uses $queryRaw for DB connectivity check

## Enums

### UserRole: ADMIN, USER, VIEWER
- @@map('user_role') with @map on each value

### DashboardStatus: DRAFT, PUBLISHED, ARCHIVED
- @@map('dashboard_status') with @map on each value

### DataSourceType: POSTGRESQL, MYSQL, REST_API, CSV
- @@map('data_source_type') with @map on each value

### WidgetType: BAR_CHART, LINE_CHART, PIE_CHART, TABLE, KPI, METRIC_CARD
- @@map('widget_type') with @map on each value

## Indexes

- All models: @@index on tenantId
- Dashboard: @@index on status, composite (tenantId, status), createdById
- Widget: @@index on dashboardId, dataSourceId, composite (tenantId, dashboardId)
- DataSource: @@index on type, composite (tenantId, type)
- Metric: @@index on dashboardId, composite (tenantId, dashboardId)

## Row Level Security

- VERIFY: AE-DATA-003 — DashboardService uses $executeRaw with Prisma.sql for tenant stats query
- All tables have ENABLE ROW LEVEL SECURITY + FORCE ROW LEVEL SECURITY
- CREATE POLICY for tenant isolation on every RLS-enabled table
- Policy uses TEXT comparison (no ::uuid cast) since tenantId is TEXT column

## Monetary Fields

- Metric.value uses Decimal @db.Decimal(12,2) — never Float
