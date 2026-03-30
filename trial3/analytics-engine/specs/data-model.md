# Data Model Specification

## Overview

The Analytics Engine data model supports multi-tenant analytics with
dashboards, widgets, data sources, and ingestion pipelines. All models
use Prisma ORM with PostgreSQL and enforce row-level security.

## Core Entities

### Tenant

Top-level organization entity with tier-based feature gating.
Tiers: FREE, PRO, ENTERPRISE. Each tier controls data source limits,
sync schedule options, and query cache TTLs.

### Dashboard

Container for widgets. Follows a status lifecycle:
DRAFT -> PUBLISHED -> ARCHIVED. Only DRAFT dashboards can be published,
and only PUBLISHED dashboards can be archived.

- VERIFY:AE-DASH-001 — Dashboard service enforces tenant scoping and
  status transitions (DRAFT->PUBLISHED->ARCHIVED) with validation

### Widget

Visual component bound to a dashboard and optionally a data source.
Types: LINE_CHART, BAR_CHART, PIE_CHART, AREA_CHART, KPI_CARD, TABLE, FUNNEL.
Widget count per dashboard is capped at MAX_WIDGETS_PER_DASHBOARD.

- VERIFY:AE-WIDGET-001 — Widget service enforces dashboard widget cap
  using MAX_WIDGETS_PER_DASHBOARD from shared

### DataSource

External data connection with encrypted configuration. Types: REST_API,
POSTGRESQL, CSV, WEBHOOK. Each data source tracks consecutive failures
and auto-pauses after MAX_SYNC_FAILURES.
See [api-endpoints.md](api-endpoints.md) for CRUD endpoints.

- VERIFY:AE-DS-001 — Data source service enforces tier-based limits
  using DATA_SOURCE_LIMITS and SYNC_SCHEDULE_BY_TIER from shared

## Row Level Security

All tables have RLS enabled and forced. The migration includes
ENABLE ROW LEVEL SECURITY and FORCE ROW LEVEL SECURITY statements
for every table. See [infrastructure.md](infrastructure.md) for migration details.

- VERIFY:AE-RLS-001 — Seed file exercises RLS migration with tenant-scoped data

## Raw SQL Usage

The dashboard service uses $executeRaw with Prisma.sql tagged template
to set the tenant context for RLS enforcement. This is the only
raw SQL usage in the application.

- VERIFY:AE-RAW-001 — Dashboard service uses $executeRaw(Prisma.sql`...`)
  for tenant context setting

## Indexes

All models with tenantId have @@index([tenantId]).
Status fields have @@index([status]).
Composite indexes on (tenantId, status) for filtered queries.
All models use @@map for snake_case table names.
All enums use @@map with @map for snake_case values.

## Naming Conventions

- Models: PascalCase with @@map('snake_case_table_name')
- Enums: PascalCase with @@map('snake_case_enum_name')
- Enum values: UPPER_CASE with @map('lower_case_value')
- Fields: camelCase (Prisma convention)
