# Data Model Specification

## Overview

The Analytics Engine data model consists of four primary entities managed via
Prisma ORM with PostgreSQL. All entities include tenantId for multi-tenant
isolation. Row-Level Security (RLS) policies enforce data isolation at the
database level as a defense-in-depth measure.

See also: security.md for RLS policy details and tenant isolation guarantees.
See also: api-endpoints.md for CRUD endpoint mappings to these models.

## Entities

### User
- id: UUID (auto-generated)
- email: String (unique)
- passwordHash: String
- role: Role enum (ADMIN, VIEWER)
- tenantId: String
- createdAt: DateTime
- updatedAt: DateTime

Table mapping: @@map("users")

VERIFY: AE-DATA-001 — User model includes tenantId for multi-tenant isolation
VERIFY: AE-DATA-002 — All models use @@map for explicit table naming and @@index on tenantId

### Dashboard
- id: UUID (auto-generated)
- name: String
- description: String (optional)
- status: Status enum (ACTIVE, ARCHIVED, ERROR)
- tenantId: String
- userId: String (FK to User)
- createdAt: DateTime
- updatedAt: DateTime

Table mapping: @@map("dashboards")
Indexes: @@index([tenantId]), @@index([tenantId, status])

### DataSource
- id: UUID (auto-generated)
- name: String
- type: String
- connectionString: String
- status: Status enum (ACTIVE, ARCHIVED, ERROR)
- tenantId: String
- userId: String (FK to User)
- createdAt: DateTime
- updatedAt: DateTime

Table mapping: @@map("data_sources")
Indexes: @@index([tenantId]), @@index([tenantId, status])

### Widget
- id: UUID (auto-generated)
- name: String
- type: String
- config: Json
- dashboardId: String (FK to Dashboard)
- dataSourceId: String (FK to DataSource, optional)
- tenantId: String
- userId: String (FK to User)
- createdAt: DateTime
- updatedAt: DateTime

Table mapping: @@map("widgets")
Indexes: @@index([tenantId]), @@index([dashboardId])

## Enums

### Role
- ADMIN: Full access to all tenant resources, can delete entities
- VIEWER: Read access and create access, cannot delete

### Status
- ACTIVE: Entity is in normal operating state
- ARCHIVED: Entity has been soft-deleted / archived
- ERROR: Entity encountered a configuration or runtime error

## Relations

- User -> Dashboard: one-to-many (userId)
- User -> DataSource: one-to-many (userId)
- User -> Widget: one-to-many (userId)
- Dashboard -> Widget: one-to-many (dashboardId, cascade delete)
- DataSource -> Widget: one-to-many (dataSourceId, optional)

## Multi-Tenant Isolation

VERIFY: AE-DATA-009 — Prisma schema uses @@index on composite keys for query performance

Every query in the service layer includes a WHERE tenantId clause.
RLS policies provide a second layer of protection at the database level.
The tenantId is extracted from the JWT token payload and injected into
every database query automatically by the service layer.

## Migration Strategy

- Initial migration creates all tables, enums, indexes, and RLS policies
- Prisma migrations are stored in prisma/migrations/
- Seed script creates initial ADMIN user and sample data
- RLS policies: ENABLE ROW LEVEL SECURITY + FORCE ROW LEVEL SECURITY
  + CREATE POLICY for SELECT, INSERT, UPDATE, DELETE on each table
