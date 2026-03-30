# Data Model Specification

## Overview

The Analytics Engine uses PostgreSQL with Prisma ORM. All models use @@map for
snake_case table naming. Multi-tenant isolation is enforced via Row Level Security.

See also: [Authentication](authentication.md) for user model and role definitions.
See also: [Security](security.md) for RLS policy details.

## Models

### User
- id: UUID primary key
- email: unique text
- password: hashed text
- name: text
- role: UserRole enum (ADMIN, USER, VIEWER)
- tenantId: text with index
- timestamps: createdAt, updatedAt

### Dashboard
- id: UUID primary key
- name: text
- description: optional text
- tenantId: text with index
- userId: FK to User
- isPublic: boolean default false
- composite index on (tenantId, isPublic)
- includes widgets relation

### DataSource
- id: UUID primary key
- name: text
- type: text (postgresql, mysql, etc.)
- config: JSON string
- status: DataSourceStatus enum (ACTIVE, INACTIVE, ERROR)
- tenantId: text with index
- refreshRate: integer default 300
- costPerQuery: Decimal(12,2) for monetary values
- composite index on (tenantId, status)

### Widget
- id: UUID primary key
- name: text
- type: WidgetType enum (CHART, TABLE, METRIC, MAP)
- config: JSON string
- dashboardId: FK to Dashboard
- dataSourceId: FK to DataSource
- tenantId: text with index
- position: integer default 0
- composite index on (tenantId, dashboardId)

## Seed Data

VERIFY: AE-DATA-001
Seed script creates admin, user, and viewer accounts plus error state data sources.

VERIFY: AE-DATA-002
PrismaService connects on module init and disconnects on destroy.

VERIFY: AE-DATA-003
Dashboard service uses $executeRaw for setting tenant context in RLS.

## Indexes

All tenantId columns are indexed. Status fields and composite (tenantId, status)
indexes are defined for query performance. Foreign key columns have dedicated indexes.

## Naming Conventions

- All models: @@map('snake_case_table_name')
- All enums: @@map('snake_case_enum_name') with @map('value') on each value
- Monetary fields: Decimal @db.Decimal(12, 2)
