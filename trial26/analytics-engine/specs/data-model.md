# Data Model Specification

## Overview

The Analytics Engine data model supports multi-tenant analytics with full data isolation via PostgreSQL Row Level Security (RLS). All domain entities are scoped by tenantId.

## Entity Relationship Diagram

```
Tenant 1──* Dashboard 1──* Widget *──1 DataSource 1──* SyncHistory
Tenant 1──* DataSource
Tenant 1──* AuditLog
Tenant 1──* User
```

## Models

### Tenant
Multi-tenant root entity representing an organization.
- id: UUID (PK)
- name: String
- tier: TenantTier (FREE, PRO, ENTERPRISE)
- createdAt, updatedAt: DateTime

### User
Authenticated user belonging to a tenant.
- id: UUID (PK)
- email: String (unique)
- password: String (bcryptjs hash)
- name: String
- tenantId: String (FK → Tenant)
- role: UserRole (ADMIN, MEMBER)
- createdAt, updatedAt: DateTime

### Dashboard
Container for analytics widgets with lifecycle status.
- id: UUID (PK)
- tenantId: String (FK → Tenant)
- name: String
- description: String?
- status: DashboardStatus (DRAFT → PUBLISHED → ARCHIVED)
- layout: String (default: 'grid')
- publishedAt: DateTime?
- createdAt, updatedAt: DateTime

### Widget
Chart or visualization bound to a data source, positioned on a dashboard grid.
- id: UUID (PK)
- dashboardId: String (FK → Dashboard)
- name: String
- type: WidgetType (LINE_CHART, BAR_CHART, PIE_CHART, AREA_CHART, KPI_CARD, TABLE, FUNNEL)
- config: String (JSON)
- positionX, positionY: Int
- width, height: Int
- dataSourceId: String? (FK → DataSource)
- createdAt, updatedAt: DateTime

### DataSource
External data connection with sync configuration.
- id: UUID (PK)
- tenantId: String (FK → Tenant)
- name: String
- type: DataSourceType (REST_API, POSTGRESQL, CSV, WEBHOOK)
- connectionConfig: String (encrypted JSON)
- status: DataSourceStatus (ACTIVE, PAUSED, ERROR)
- syncSchedule: String?
- lastSyncAt: DateTime?
- failureCount: Int (default: 0)
- createdAt, updatedAt: DateTime

### SyncHistory
Record of a data sync attempt.
- id: UUID (PK)
- dataSourceId: String (FK → DataSource)
- status: SyncRunStatus (RUNNING, COMPLETED, FAILED)
- recordsProcessed: Int
- errorMessage: String?
- startedAt, completedAt: DateTime

### AuditLog
Immutable event log for tenant actions.
- id: UUID (PK)
- tenantId: String (FK → Tenant)
- userId: String?
- action: String
- entity: String
- entityId: String?
- metadata: String?
- createdAt: DateTime

## Data Architecture Requirements

- All tables use @@map("snake_case") naming
- All enums use @map("VALUE") on each variant
- Foreign keys have @@index declarations
- Tenanted models have @@index([tenantId]) and @@index([tenantId, status]) where applicable
- RLS policies on all tenanted tables (See specs/security.md)
- PrismaService provides setTenantContext(tenantId) via $executeRaw

## Verification

<!-- VERIFY: AE-DATA-001 — All models have @@map snake_case table names -->
<!-- VERIFY: AE-DATA-002 — All enums have @map on each value -->
<!-- VERIFY: AE-DATA-003 — Foreign keys have @@index declarations -->
<!-- VERIFY: AE-DATA-004 — RLS policies on all tenanted tables -->
<!-- VERIFY: AE-DATA-005 — PrismaService has setTenantContext method -->
