# Data Model Specification

## Overview

The Analytics Engine data model is defined in Prisma schema and consists of six
core entities plus the User entity. All entities include a tenantId field for
multi-tenant isolation via PostgreSQL Row-Level Security.

## Prisma Schema

The Prisma schema defines all models, relations, indexes, and RLS policies.
It uses PostgreSQL as the provider with the `prisma-client-js` generator.
Migrations are managed via `prisma migrate` commands.

## Core Entities

### User
- Fields: id (UUID), email (unique per tenant), passwordHash, name, role (enum), tenantId
- Role enum: ADMIN, EDITOR, VIEWER
- Relations: owns Dashboards, referenced in AuditLogs

### Dashboard
- Fields: id, name, description, isPublic, userId (owner), tenantId, timestamps
- Relations: belongs to User, has many Widgets
- Cascade: deleting dashboard removes all widgets

### Widget
- Fields: id, title, type, config (JSON), position (Int), dashboardId, tenantId, timestamps
- Relations: belongs to Dashboard
- Defaults: config={}, position=0

### DataSource
- Fields: id, name, type, connectionString, isActive, tenantId, timestamps
- Relations: has many SyncHistory records
- Cascade: deleting data source removes sync histories

### SyncHistory
- Fields: id, status (enum), recordCount, startedAt, completedAt, errorMessage, dataSourceId, tenantId
- Status enum: PENDING, RUNNING, COMPLETED, FAILED
- Relations: belongs to DataSource

### AuditLog
- Fields: id, action (enum), entityType, entityId, userId, details (JSON), tenantId, timestamp
- Action enum: CREATE, UPDATE, DELETE, LOGIN, EXPORT
- Immutable: no update or delete operations

## Shared Package

<!-- VERIFY:TEST-SHARED -->
The shared package (`packages/shared`) exports common types, constants, and
utilities used by both the API and web packages. Unit tests verify that all
exports are correctly re-exported from the index file.

## Indexes and Constraints

- Unique: User.email per tenant
- Foreign keys: Widget.dashboardId, SyncHistory.dataSourceId, Dashboard.userId
- Indexes: tenantId on all tables for RLS performance
- AuditLog indexed by (tenantId, entityType, entityId)

## Cross-References

- Prisma module configuration: see [infrastructure.md](infrastructure.md)
- Tenant isolation: see [security.md](security.md)
- Entity endpoints: see [api-endpoints.md](api-endpoints.md)

<!-- VERIFY:PRISMA-MODULE-SPEC -->
