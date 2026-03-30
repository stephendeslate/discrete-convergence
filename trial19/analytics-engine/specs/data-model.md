# Data Model Specification

## Overview

PostgreSQL schema managed by Prisma ORM with Row Level Security (RLS) for tenant isolation.

## Requirements

### AE-DATA-001: Prisma Client Lifecycle
- **VERIFY**: PrismaService connects on module init and disconnects on module destroy
- Service extends PrismaClient for direct query access

### AE-DATA-002: Schema Models
- **VERIFY**: Schema defines Tenant, User, Dashboard, DataSource, Widget models with proper relations
- All models use @@map for snake_case table names
- Foreign keys reference parent entities with proper cascade behavior

### AE-DATA-003: Row Level Security
- **VERIFY**: RLS policies enforce tenant isolation at the database level using TEXT comparison
- Policies use `current_setting('app.current_tenant_id')` for context
- ENABLE ROW LEVEL SECURITY and FORCE applied to all tenant-scoped tables

### AE-DATA-004: Tenant Context Setting
- **VERIFY**: PrismaService.setTenantContext uses $executeRaw with Prisma.sql template
- Context is set per-transaction using `set_config` with `is_local = true`

### AE-DATA-005: Composite Indexes
- **VERIFY**: Composite indexes exist for tenantId+status, tenantId+type, tenantId+dashboardId
- Single-column indexes on tenantId, email, status, type for common queries

### AE-DATA-006: Enum Mappings
- **VERIFY**: All enums use @map for snake_case database values and @@map for table names
- UserRole, DashboardStatus, DataSourceType, WidgetType follow consistent naming
