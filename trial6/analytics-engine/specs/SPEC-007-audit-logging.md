# SPEC-007: Audit Logging

> **Status:** APPROVED
> **Priority:** P1
> **Cross-references:** SPEC-006 (multi-tenancy)

## Overview

The AuditLog entity provides an immutable record of actions performed within
each tenant. Audit logs are used for compliance, debugging, and activity tracking.

## Requirements

### Audit Log Model
<!-- VERIFY: audit-model -->
- id: UUID primary key
- action: string (e.g., "CREATE", "UPDATE", "DELETE", "LOGIN")
- entityType: string (e.g., "Dashboard", "DataSource", "Widget", "User")
- entityId: string (the ID of the affected entity)
- tenantId: foreign key to Tenant
- userId: optional foreign key to User (null for system actions)
- metadata: optional JSON (additional context about the action)
- createdAt: timestamp (immutable, no updatedAt)

### Indexing
<!-- VERIFY: audit-indexes -->
- Index on tenantId for tenant-scoped queries
- Index on (entityType, entityId) for entity history lookups
- Composite index on (tenantId, action) for filtered tenant queries

### Immutability
<!-- VERIFY: audit-immutable -->
- Audit logs have no update or delete endpoints
- The model has createdAt but no updatedAt field
- Records are append-only for compliance purposes

### Tenant Isolation
<!-- VERIFY: audit-tenant -->
- All audit log queries are scoped by tenantId (see SPEC-006)
- RLS policy on audit_logs table enforces database-level isolation

## Verification Criteria

| VERIFY Tag | Assertion | Test Location |
|-----------|-----------|---------------|
| audit-model | AuditLog has id, action, entityType, entityId, tenantId, userId?, metadata?, createdAt (no updatedAt) | prisma/schema.prisma |
| audit-indexes | Indexes on tenantId, (entityType, entityId), (tenantId, action) | prisma/schema.prisma |
| audit-immutable | No update/delete endpoints for audit logs, model has createdAt only | prisma/schema.prisma, no audit controller mutations |
| audit-tenant | tenantId foreign key in model, RLS policy in migration SQL | prisma/schema.prisma, prisma/migrations/0001_init/migration.sql |
