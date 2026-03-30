# Data Model Specification

## Overview

The Analytics Engine uses Prisma ORM with PostgreSQL. The schema defines five core entities: Tenant, User, Dashboard, Widget, and DataSource. All entities follow multi-tenant isolation patterns.

See also: [security.md](security.md) for RLS policies, [api-endpoints.md](api-endpoints.md) for CRUD operations.

## Entities

### Tenant
- id: UUID primary key (auto-generated)
- name: String
- createdAt, updatedAt: DateTime
- Relations: users[], dashboards[], widgets[], dataSources[]

### User
- id: UUID primary key
- email: String (unique)
- passwordHash: String
- role: UserRole enum (ADMIN, VIEWER)
- tenantId: String (foreign key to Tenant)

### Dashboard
- id: UUID primary key
- title: String
- description: String (optional)
- status: DashboardStatus enum (DRAFT, PUBLISHED, ARCHIVED)
- tenantId: String (foreign key to Tenant)
- Relations: widgets[]

### Widget
- id: UUID primary key
- title: String
- type: WidgetType enum (BAR_CHART, LINE_CHART, PIE_CHART, TABLE, KPI)
- config: Json
- dashboardId: String (foreign key to Dashboard)
- dataSourceId: String (optional, foreign key to DataSource)
- tenantId: String (foreign key to Tenant)

### DataSource
- id: UUID primary key
- name: String
- type: DataSourceType enum (POSTGRESQL, MYSQL, REST_API, CSV)
- connectionInfo: Json
- tenantId: String (foreign key to Tenant)

## Prisma Conventions

VERIFY: AE-DATA-001 — PrismaService extends PrismaClient with onModuleInit and onModuleDestroy lifecycle hooks

VERIFY: AE-DATA-002 — All models use @@map for snake_case table names, all enums use @@map with @map on values

VERIFY: AE-DATA-003 — Dashboards include @@index on tenantId, status, and composite (tenantId, status)

VERIFY: AE-DATA-004 — Widgets include @@index on tenantId, dashboardId, and dataSourceId

VERIFY: AE-DATA-005 — DataSources include @@index on tenantId

VERIFY: AE-DATA-006 — Migration includes RLS ENABLE, FORCE, and CREATE POLICY for all tables with tenant_id

## Row Level Security

All tables with tenant_id have RLS enabled:
- ENABLE ROW LEVEL SECURITY
- FORCE ROW LEVEL SECURITY
- CREATE POLICY using TEXT comparison (no ::uuid cast on TEXT columns)
