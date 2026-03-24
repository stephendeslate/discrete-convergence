# SPEC-006: Multi-Tenancy

> **Status:** APPROVED
> **Priority:** P0
> **Cross-references:** SPEC-001 (authentication), SPEC-008 (security)

## Overview

The Analytics Engine is a multi-tenant platform. Tenant isolation is enforced at
two levels: application-level filtering in every service method and database-level
Row Level Security (RLS) policies in the PostgreSQL migration.

## Requirements

### Application-Level Isolation
<!-- VERIFY: tenancy-app-level -->
- Every service method for tenant-scoped entities receives tenantId as first parameter
- tenantId is extracted from JWT payload via auth-utils.getTenantId(req)
- All Prisma queries include tenantId in the where clause
- findOne operations verify tenantId match after lookup; throw NotFoundException on mismatch
- This prevents any cross-tenant data access regardless of RLS state

### Database-Level RLS
<!-- VERIFY: tenancy-rls -->
- Initial migration enables ROW LEVEL SECURITY on all tables
- FORCE ROW LEVEL SECURITY ensures policies apply even to table owners
- Policies use current_setting('app.current_tenant_id', true) for tenant filtering
- Direct tenant-scoped tables (tenants, users, dashboards, data_sources, audit_logs) filter by tenant_id
- Indirect tenant-scoped tables (widgets, sync_runs) use subquery joins to parent tables

### Tenant Model
<!-- VERIFY: tenancy-model -->
- id: UUID primary key
- name: string, required
- domain: string, optional (for custom domain support)
- tier: TenantTier enum (FREE, PRO, ENTERPRISE)
- theme: JSON, optional (for UI customization)
- createdAt, updatedAt: timestamps
- Has many: users, dashboards, dataSources, auditLogs

### JWT Integration
<!-- VERIFY: tenancy-jwt -->
- JWT payload includes tenantId field (see SPEC-001)
- JwtStrategy.validate() returns tenantId in the user object
- All protected controllers extract tenantId from req.user
- auth-utils provides getTenantId() and getUserId() helpers
