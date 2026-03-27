# Data Model Specification

## Overview

The Analytics Engine uses Prisma 6 with PostgreSQL 16 and Row-Level Security (RLS)
for multi-tenant data isolation. All domain models include a tenantId foreign key.

## Entities

### VERIFY: AE-DATA-001 — Tenant model
The Tenant model represents an organization using the platform.
Fields: id, name, tier (FREE/PRO/ENTERPRISE), createdAt, updatedAt.

### VERIFY: AE-DATA-002 — User model
The User model represents an authenticated user belonging to a tenant.
Fields: id, email (unique), password, name, tenantId, createdAt, updatedAt.

### VERIFY: AE-DATA-003 — Dashboard model
The Dashboard model is the central analytics container.
Fields: id, tenantId, name, description, status (DRAFT/PUBLISHED/ARCHIVED),
layout, publishedAt, createdAt, updatedAt.
Status transitions: DRAFT → PUBLISHED → ARCHIVED.

### VERIFY: AE-DATA-004 — Widget model
The Widget model represents a chart or visualization within a dashboard.
Fields: id, dashboardId, name, type (LINE_CHART/BAR_CHART/PIE_CHART/AREA_CHART/KPI_CARD/TABLE/FUNNEL),
config (JSON), positionX, positionY, width, height, dataSourceId, createdAt, updatedAt.

### VERIFY: AE-DATA-005 — DataSource model
The DataSource model represents an external data connection.
Fields: id, tenantId, name, type (REST_API/POSTGRESQL/CSV/WEBHOOK),
configEncrypted, status (ACTIVE/PAUSED/ERROR), lastSyncAt, consecutiveFailures,
createdAt, updatedAt.

### VERIFY: AE-DATA-006 — SyncRun model
The SyncRun model records synchronization attempts.
Fields: id, dataSourceId, status (IDLE/RUNNING/COMPLETED/FAILED),
rowsIngested, errorMessage, startedAt, completedAt, createdAt.

### VERIFY: AE-DATA-007 — AuditLog model
The AuditLog model provides an immutable event trail.
Fields: id, tenantId, action, entity, entityId, userId, metadata (JSON), createdAt.

## Relationships

- Tenant has many Users, Dashboards, DataSources, AuditLogs
- Dashboard has many Widgets
- Widget optionally belongs to a DataSource
- DataSource has many SyncRuns

## Row-Level Security

Every tenanted table has RLS enabled and forced with a policy using:
`current_setting('app.current_tenant_id', true)`

The PrismaService.setTenantContext() method sets this via $executeRaw.

## Indexes

All foreign keys have corresponding indexes.
Composite indexes on (tenantId, status) for filtered queries.

## Cross-References

- API operations on these models: See [api-endpoints.md](api-endpoints.md)
- Security implications: See [security.md](security.md)
- Edge cases: See [edge-cases.md](edge-cases.md)
