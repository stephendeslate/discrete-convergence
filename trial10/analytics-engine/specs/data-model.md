# Data Model Specification

## Overview

The Analytics Engine data model supports multi-tenant analytics with dashboards,
widgets, data sources, and metrics. All entities are tenant-scoped.

See also: [Security Specification](security.md) for RLS policies.
See also: [API Endpoints](api-endpoints.md) for CRUD operations.

## Entities

### User

Fields: id (UUID), email (unique), passwordHash, name, role (UserRole), tenantId, timestamps.
Indexes: tenantId, email.

### Dashboard

Fields: id (UUID), title, description, status (DashboardStatus), tenantId, userId, timestamps.
Relations: belongs to User, has many Widgets.
Indexes: tenantId, status, (tenantId, status), userId.

### Widget

Fields: id (UUID), title, type (WidgetType), config (JSON string), position, tenantId,
dashboardId, dataSourceId (optional), timestamps.
Relations: belongs to Dashboard, optionally belongs to DataSource.
Indexes: tenantId, dashboardId, dataSourceId, (tenantId, type).

### DataSource

Fields: id (UUID), name, type (DataSourceType), connectionUrl, tenantId, isActive,
lastSyncAt (optional), timestamps.
Relations: has many Widgets.
Indexes: tenantId, isActive, (tenantId, isActive).

### Metric

Fields: id (UUID), name, value (Decimal 12,2), unit, tenantId, dataSourceId (optional),
recordedAt, createdAt.
Indexes: tenantId, recordedAt, (tenantId, name).

VERIFY: AE-DATA-001
PrismaService extends PrismaClient and implements OnModuleInit/OnModuleDestroy
for proper connection lifecycle management.

VERIFY: AE-DATA-002
DashboardService uses $executeRaw with Prisma.sql tagged template for safe
raw SQL execution when computing dashboard statistics.

## Enums

All enums use @@map for snake_case table names and @map for individual values:
- UserRole: ADMIN, USER, VIEWER
- WidgetType: CHART, TABLE, METRIC, MAP
- DataSourceType: POSTGRESQL, MYSQL, REST_API, CSV
- DashboardStatus: DRAFT, PUBLISHED, ARCHIVED

## Naming Conventions

All models use @@map('snake_case_table_name') for PostgreSQL table names.
All fields use @map('snake_case_column') where Prisma camelCase differs.
Monetary values use Decimal @db.Decimal(12, 2) — never Float.

## Row Level Security

All tables have ENABLE ROW LEVEL SECURITY + FORCE ROW LEVEL SECURITY.
CREATE POLICY statements enforce tenant isolation using current_setting.
tenant_id columns are TEXT type — RLS policies use direct string comparison
without ::uuid cast.
