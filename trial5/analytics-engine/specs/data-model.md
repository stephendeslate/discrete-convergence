# Data Model Specification

## Overview

The data model is defined in Prisma schema with PostgreSQL as the backing database.
All entities support multi-tenancy through tenant ID foreign keys.

## Entities

### Tenant
- Root entity for multi-tenancy
- Fields: id, name, domain, tier (FREE/PRO/ENTERPRISE), theme (JSON), timestamps
- Has many: users, dashboards, dataSources, auditLogs

### User
- Authenticated user within a tenant
- Fields: id, email, passwordHash, role (ADMIN/USER/VIEWER), tenantId, timestamps
- Indexed on: tenantId, email

### Dashboard
- Analytics dashboard container
- Fields: id, title, description, status (DRAFT/PUBLISHED/ARCHIVED), tenantId, timestamps
- Has many: widgets
- Indexed on: tenantId, status, (tenantId + status)

<!-- VERIFY: AE-DASH-001 -->

### Widget
- Visualization component on a dashboard
- Fields: id, type (LINE/BAR/PIE/AREA/KPI/TABLE/FUNNEL), title, config (JSON), dashboardId, timestamps
- Belongs to: dashboard
- Indexed on: dashboardId

<!-- VERIFY: AE-WID-001 -->

### DataSource
- External data connection
- Fields: id, name, type (POSTGRES/MYSQL/REST_API/CSV), config (JSON), tenantId, timestamps
- Has many: syncRuns
- Indexed on: tenantId, (tenantId + type)

<!-- VERIFY: AE-DS-001 -->

### SyncRun
- Data sync execution record
- Fields: id, status (IDLE/RUNNING/COMPLETED/FAILED), startedAt, completedAt, rowsIngested, errorMessage, dataSourceId, createdAt
- Belongs to: dataSource
- Indexed on: dataSourceId, status, (dataSourceId + status)

### AuditLog
- Immutable compliance log
- Fields: id, action, entityType, entityId, tenantId, userId, metadata (JSON), createdAt
- Indexed on: tenantId, (entityType + entityId), (tenantId + action)

## Row-Level Security

All tables have PostgreSQL RLS policies enforcing tenant isolation at the database level
using `current_setting('app.current_tenant_id', true)`.

## Migrations

Migration `0001_init` creates all tables, enums, indexes, foreign keys, and RLS policies.
