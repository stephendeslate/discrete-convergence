# Data Model Specification

## Overview

The Analytics Engine data model supports multi-tenant analytics dashboards with
widgets, data sources, and audit logging. All models use UUID primary keys and
include tenant isolation. See [security.md](security.md) for RLS details.

## Entity Definitions

### Tenant
- Primary isolation boundary for multi-tenant SaaS
- Fields: id, name, slug (unique), createdAt, updatedAt
- Has many: Users, Dashboards, Widgets, DataSources, AuditLogs

### User
- Authenticated platform user with role-based access
- Fields: id, email (unique), passwordHash, name, role, tenantId, timestamps
- Roles: ADMIN, USER, VIEWER (enum with @@map)
- Indexes: tenantId, role, composite (tenantId, role)

### Dashboard
- Container for analytics widgets with lifecycle status
- Fields: id, title, description, status, tenantId, timestamps
- Statuses: ACTIVE, ARCHIVED, DRAFT (enum with @@map)
- Indexes: tenantId, status, composite (tenantId, status)

### Widget
- Visual component within a dashboard
- Fields: id, title, type, config (JSON), position, size, refreshRate, costPerQuery (Decimal), dashboardId, dataSourceId, tenantId
- Types: CHART, TABLE, METRIC, MAP (enum with @@map)
- costPerQuery uses Decimal @db.Decimal(12, 2) — never Float
- Indexes: dashboardId, tenantId, dataSourceId, composite (tenantId, dashboardId)

### DataSource
- External data connection for widgets
- Fields: id, name, type, connectionUrl, status, monthlyCost (Decimal), lastSyncAt, tenantId
- monthlyCost uses Decimal @db.Decimal(12, 2)
- Indexes: tenantId, status, composite (tenantId, status)

### AuditLog
- Immutable audit trail for compliance
- Fields: id, action, entity, entityId, details (JSON), userId, tenantId, createdAt
- Actions: CREATE, UPDATE, DELETE, LOGIN, LOGOUT
- Indexes: tenantId, userId, action, composite (tenantId, action)

- VERIFY: AE-DATA-001 — PrismaService connects to PostgreSQL and provides ORM access

## Enum Mapping

All enums use @@map for snake_case table mapping and @map for value mapping:
- UserRole @@map("user_role")
- DashboardStatus @@map("dashboard_status")
- WidgetType @@map("widget_type")
- DataSourceType @@map("data_source_type")
- DataSourceStatus @@map("data_source_status")
- AuditAction @@map("audit_action")

## Row Level Security

All tables have RLS enabled (ENABLE ROW LEVEL SECURITY + FORCE ROW LEVEL SECURITY)
to prevent direct database access from bypassing tenant isolation.

## Monetary Fields

All monetary fields use Decimal @db.Decimal(12, 2):
- Widget.costPerQuery
- DataSource.monthlyCost
Float is never used for monetary values.
