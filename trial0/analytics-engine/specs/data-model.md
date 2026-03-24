# Data Model Specification

## Overview

Prisma 6 schema with 15 models, 8 enums, multi-tenant isolation via tenantId
foreign keys and PostgreSQL Row Level Security policies.

## Entity Listing

- VERIFY:AE-SCHEMA-001 — Full Prisma schema for analytics engine
- VERIFY:AE-SCHEMA-002 — Tenant: id, name, slug, tier (FREE/STARTER/PRO/ENTERPRISE), settings JSONB
- VERIFY:AE-SCHEMA-003 — User: id, email, name, passwordHash, role, tenantId FK
- VERIFY:AE-SCHEMA-004 — Dashboard: id, name, description, status (DRAFT/PUBLISHED/ARCHIVED), tenantId FK
- VERIFY:AE-SCHEMA-005 — Widget: id, name, type (BAR/LINE/PIE/TABLE/KPI/SCATTER/MAP/HEATMAP),
  config JSONB, position JSONB, dashboardId FK, dataSourceId FK
- VERIFY:AE-SCHEMA-006 — DataSource: id, name, connector type
  (POSTGRESQL/MYSQL/REST_API/CSV/GOOGLE_SHEETS/SNOWFLAKE/BIGQUERY),
  connectionConfig JSONB (encrypted at rest), syncSchedule, status, failureCount
- VERIFY:AE-SCHEMA-007 — FieldMapping: id, sourceField, targetField, transform, dataSourceId FK
- VERIFY:AE-SCHEMA-008 — SyncRun: id, status (PENDING/RUNNING/COMPLETED/FAILED),
  recordsProcessed, errorMessage, dataSourceId FK
- VERIFY:AE-SCHEMA-009 — DataPoint: id, dimensions JSONB, metrics JSONB, timestamp, dataSourceId FK
- VERIFY:AE-SCHEMA-010 — AggregatedDataPoint: granularity (MINUTE/HOUR/DAY/WEEK/MONTH),
  dimensions JSONB, metrics JSONB, periodStart, dataSourceId FK
- VERIFY:AE-SCHEMA-011 — EmbedConfig: id, dashboardId (unique), allowedOrigins, theme,
  showHeader boolean, customCSS optional
- VERIFY:AE-SCHEMA-012 — QueryCache: id, queryHash (unique), result JSONB, expiresAt
- VERIFY:AE-SCHEMA-013 — DeadLetterEvent: id, payload JSONB, errorMessage, retryCount
- VERIFY:AE-SCHEMA-014 — ApiKey: id, keyPrefix, keyHash, name, permissions string[],
  lastUsedAt, expiresAt, userId FK
- VERIFY:AE-SCHEMA-015 — AuditLog: id, action, entityType, entityId, changes JSONB,
  userId FK, tenantId FK, immutable

## Enum Conventions

All enums use @@map for database naming and @map on each value:
- TenantTier: FREE, STARTER, PRO, ENTERPRISE → mapped to tenant_tier
- UserRole: ADMIN, USER, VIEWER → mapped to user_role
- DashboardStatus: DRAFT, PUBLISHED, ARCHIVED → mapped to dashboard_status
- WidgetType: BAR, LINE, PIE, TABLE, KPI, SCATTER, MAP, HEATMAP → mapped to widget_type
- ConnectorType: 7 values → mapped to connector_type
- SyncStatus: PENDING, RUNNING, COMPLETED, FAILED → mapped to sync_status
- Granularity: MINUTE, HOUR, DAY, WEEK, MONTH → mapped to granularity
- DataSourceStatus: ACTIVE, PAUSED, ERROR → mapped to data_source_status

## Indexes

All tenant-scoped tables have @@index([tenantId]).
Composite indexes on frequently queried combinations:
- Dashboard: @@index([tenantId, status])
- Widget: @@index([dashboardId])
- DataSource: @@index([tenantId, status])
- SyncRun: @@index([dataSourceId, status])
- DataPoint: @@index([dataSourceId, timestamp])
- AuditLog: @@index([tenantId, createdAt])

## Row Level Security

- VERIFY:AE-MIG-001 — Migration enables RLS on all tenant-scoped tables
- Each table: ALTER TABLE ... ENABLE ROW LEVEL SECURITY
- Each table: ALTER TABLE ... FORCE ROW LEVEL SECURITY
- Policy: CREATE POLICY tenant_isolation ON ... USING (tenant_id = current_setting('app.tenant_id'))
- VERIFY:AE-RAW-001 — $executeRaw with Prisma.sql for RLS context setup

## Cross-References

- See [api-endpoints.md](api-endpoints.md) for CRUD operations on each entity
- See [security.md](security.md) for RLS enforcement details
- See [infrastructure.md](infrastructure.md) for migration workflow

## Seed Data

- VERIFY:AE-SEED-001 — Seed script uses BCRYPT_SALT_ROUNDS from shared, has error handling
- VERIFY:AE-SEED-002 — Includes error/failure state data: archived dashboard, failed data source,
  failed sync run, dead letter event
