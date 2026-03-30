# Data Model Specification

## Overview

The Analytics Engine data model consists of five core entities: User, Dashboard,
Widget, DataSource, and QueryExecution. All entities support multi-tenant isolation
through tenantId fields with Row Level Security policies.

See also: [API Endpoints](api-endpoints.md) for CRUD operations on these entities.
See also: [Security Specification](security.md) for RLS policy details.

## Entities

### User
- id: UUID (primary key)
- email: unique, indexed
- password: bcryptjs hashed
- name: string
- role: UserRole enum (ADMIN, USER, VIEWER)
- tenantId: indexed for tenant isolation

### Dashboard
- id: UUID (primary key)
- name: string
- description: optional string
- status: DashboardStatus enum (DRAFT, PUBLISHED, ARCHIVED)
- tenantId: indexed, composite index with status
- userId: foreign key to User
- widgets: one-to-many relation

### Widget
- id: UUID (primary key)
- name: string
- type: WidgetType enum (BAR_CHART, LINE_CHART, PIE_CHART, TABLE, KPI, SCATTER_PLOT)
- config: JSON string for widget configuration
- dashboardId: foreign key to Dashboard
- dataSourceId: optional foreign key to DataSource
- position (x, y), dimensions (width, height)
- tenantId: indexed

### DataSource
- id: UUID (primary key)
- name: string
- type: DataSourceType enum (POSTGRESQL, MYSQL, REST_API, CSV)
- connectionString: optional, for database connections
- status: DataSourceStatus enum (ACTIVE, INACTIVE, ERROR, CONNECTING)
- tenantId: indexed, composite index with status

### QueryExecution
- id: UUID (primary key)
- query: SQL or query text
- dataSourceId: foreign key reference
- executionTime: milliseconds
- rowCount: number of rows returned
- cost: Decimal(12,2) for query cost tracking
- status: string (completed, failed)
- tenantId: indexed

## Requirements

- VERIFY: AE-DATA-001 — All models use @@map for snake_case table names
- VERIFY: AE-DATA-002 — All enums use @@map and @map for snake_case mapping
- VERIFY: AE-DATA-003 — @@index on tenantId, status, and composite (tenantId, status)
- VERIFY: AE-DATA-004 — Monetary fields use Decimal @db.Decimal(12, 2)
- VERIFY: AE-DATA-005 — Row Level Security enabled and forced on all tables

## Indexes

- users: tenantId, email
- dashboards: tenantId, status, (tenantId, status), userId
- widgets: tenantId, dashboardId, dataSourceId
- data_sources: tenantId, status, (tenantId, status)
- query_executions: tenantId, dataSourceId, (tenantId, status)
