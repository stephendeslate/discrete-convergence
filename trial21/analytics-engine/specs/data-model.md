# Data Model Specification

## Overview

The analytics engine uses PostgreSQL via Prisma ORM with a multi-tenant data model.
All tenant-scoped tables enforce Row Level Security (RLS) for data isolation.

Cross-reference: See [security.md](security.md) for RLS policy details.
Cross-reference: See [api-endpoints.md](api-endpoints.md) for CRUD operations on entities.

## Core Entities

### Tenant
- Multi-tenant root entity
- Tiers: FREE (3 data sources), PRO (20), ENTERPRISE (unlimited)
- All child entities reference tenantId

### User
- Belongs to a Tenant
- Roles: ADMIN, USER, VIEWER
- Email unique across system
- Password stored as bcrypt hash

### Dashboard
- Lifecycle: DRAFT -> PUBLISHED -> ARCHIVED
- Contains up to 20 widgets
- Must be PUBLISHED for embed functionality

### Widget
- 7 types: LINE_CHART, BAR_CHART, PIE_CHART, AREA_CHART, TABLE, METRIC_CARD, SCATTER_PLOT
- Grid positioning (positionX, positionY, width, height)
- Optionally linked to a DataSource

### DataSource
- Types: REST, POSTGRESQL, CSV, WEBHOOK
- Configuration stored encrypted in DataSourceConfig
- sourceHash for idempotent sync operations

### DataPoint
- Time-series data with Decimal(12,2) values
- Dimensions stored as JSON for flexible categorization

### AggregatedDataPoint
- Pre-computed aggregations by period
- Includes count, min, max alongside value

## VERIFY Tags

VERIFY: AE-DATA-001 — pagination limits enforced by MAX_PAGE_SIZE constant
VERIFY: AE-DATA-002 — pagination DTO enforces max page size via class-validator
VERIFY: AE-DATA-003 — pagination utility clamps values to MAX_PAGE_SIZE
VERIFY: AE-DATA-004 — data preview and widget data endpoints

## Database Conventions

- All models use @@map('snake_case') for table names
- All enums use @@map and @map for PostgreSQL enum values
- @@index on tenantId, status, and composite (tenantId, status)
- Monetary fields use Decimal @db.Decimal(12,2)

## Edge Cases

VERIFY: AE-DATA-005 — page number less than 1 defaults to first page
VERIFY: AE-DATA-006 — limit exceeding MAX_PAGE_SIZE clamped to 100
VERIFY: AE-DATA-007 — empty result set returns valid paginated response with zero total
