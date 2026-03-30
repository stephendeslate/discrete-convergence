# Data Model Specification

## Overview

The Analytics Engine uses Prisma ORM with PostgreSQL. All models use @@map for
snake_case table names and @map for snake_case enum values. Row Level Security
is enforced at the database level for tenant isolation.

## Entities

### User
- id: UUID (primary key)
- email: String (unique)
- passwordHash: String
- tenantId: String
- role: UserRole enum
- createdAt: DateTime
- updatedAt: DateTime
- Table: @@map("users")

<!-- VERIFY:DM-USER-MODEL — User model has all required fields and @@map -->

### Dashboard
- id: UUID (primary key)
- name: String
- description: String (optional)
- userId: String (FK to User)
- tenantId: String
- isPublic: Boolean (default: false)
- createdAt: DateTime
- updatedAt: DateTime
- Table: @@map("dashboards")
- Indexes: @@index([userId]), @@index([tenantId])

<!-- VERIFY:DM-DASHBOARD-MODEL — Dashboard has @@map and @@index on FKs -->

### Widget
- id: UUID (primary key)
- name: String
- type: WidgetType enum
- config: Json
- dashboardId: String (FK to Dashboard)
- dataSourceId: String (FK to DataSource, optional)
- tenantId: String
- createdAt: DateTime
- updatedAt: DateTime
- Table: @@map("widgets")
- Indexes: @@index([dashboardId]), @@index([dataSourceId]), @@index([tenantId])

<!-- VERIFY:DM-WIDGET-MODEL — Widget has @@map, @@index, and WidgetType enum -->

### DataSource
- id: UUID (primary key)
- name: String
- type: DataSourceType enum
- connectionConfig: Json
- userId: String (FK to User)
- tenantId: String
- lastSyncAt: DateTime (optional)
- createdAt: DateTime
- updatedAt: DateTime
- Table: @@map("data_sources")
- Indexes: @@index([userId]), @@index([tenantId])

<!-- VERIFY:DM-DATASOURCE-MODEL — DataSource has @@map and @@index -->

### SyncHistory
- id: UUID (primary key)
- dataSourceId: String (FK to DataSource)
- tenantId: String
- status: SyncStatus enum
- recordsProcessed: Int
- errorMessage: String (optional)
- startedAt: DateTime
- completedAt: DateTime (optional)
- Table: @@map("sync_history")
- Indexes: @@index([dataSourceId]), @@index([tenantId])

### AuditLog
- id: UUID (primary key)
- action: String
- entityType: String
- entityId: String
- userId: String
- tenantId: String
- metadata: Json (optional)
- createdAt: DateTime
- Table: @@map("audit_logs")
- Indexes: @@index([userId]), @@index([tenantId])

## Enums

### UserRole
- ADMIN @map("admin")
- EDITOR @map("editor")
- VIEWER @map("viewer")

### WidgetType
- CHART @map("chart")
- TABLE @map("table")
- METRIC @map("metric")
- TEXT @map("text")

### DataSourceType
- POSTGRESQL @map("postgresql")
- MYSQL @map("mysql")
- CSV @map("csv")
- API @map("api")

### SyncStatus
- PENDING @map("pending")
- RUNNING @map("running")
- COMPLETED @map("completed")
- FAILED @map("failed")

<!-- VERIFY:DM-ENUM-MAP — All enum values use @map for snake_case -->

## Row Level Security

Each tenanted table has RLS enabled in the migration SQL:

```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_name FORCE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON table_name
  USING (tenant_id = current_setting('app.current_tenant_id'));
```

<!-- VERIFY:DM-RLS-ENABLE — RLS ENABLE + FORCE on all tenanted tables -->
<!-- VERIFY:DM-RLS-POLICY — CREATE POLICY with current_setting for tenant isolation -->

## Prisma Service

PrismaService extends PrismaClient and provides:
- setTenantContext(tenantId): Sets app.current_tenant_id via $executeRaw
- withTenant(tenantId, callback): Wraps operations with tenant context
- onModuleInit(): Connects to database
- enableShutdownHooks(): Graceful shutdown

## Migration

Single initial migration: 20240101000000_init/migration.sql
Contains all CREATE TABLE, CREATE INDEX, and RLS statements.

## Implementation Traceability

<!-- VERIFY:PRISMA-SVC — Prisma service implementation -->
<!-- VERIFY:PRISMA-MOD — Prisma module definition -->
<!-- VERIFY:PRISMA-SVC-TEST — Prisma service unit tests -->
<!-- VERIFY:SEED — Database seed script -->
