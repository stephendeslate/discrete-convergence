# Data Sources Specification

## Overview

Data sources represent external data connections that feed widgets.
Each data source has a type (postgresql, mysql, csv, api) that determines
how data is fetched and synchronized.

## Domain Model

- id: UUID
- name: String (required, max 255 chars)
- type: DataSourceType enum (postgresql, mysql, csv, api)
- connectionConfig: Json (type-specific connection details)
- userId: FK to User
- tenantId: String (for RLS)
- lastSyncAt: DateTime (optional)

## Data Source Types

### PostgreSQL
- connectionConfig: { host, port, database, username, password }
- Sync: Executes configured query

### MySQL
- connectionConfig: { host, port, database, username, password }
- Sync: Executes configured query

### CSV
- connectionConfig: { url, delimiter, hasHeaders }
- Sync: Downloads and parses CSV file

### API
- connectionConfig: { url, method, headers, body }
- Sync: Fetches data from REST API endpoint

## Sync Operation

sync method uses switch/case branching by data source type:
- postgresql: Connect to PostgreSQL, execute query
- mysql: Connect to MySQL, execute query
- csv: Download and parse CSV
- api: HTTP request to external API
- default: Throws BadRequestException

Creates SyncHistory record with status tracking.

<!-- VERIFY:DS-SYNC-BRANCHING — sync method uses switch/case by type -->

## Test Connection

testConnection method validates connectivity:
- Checks connection config completeness (switch by type)
- Validates required fields per data source type
- Returns success/failure without actual connection

<!-- VERIFY:DS-TEST-CONNECTION — testConnection validates per type -->

## CRUD Operations

- POST /data-sources — Create data source
- GET /data-sources — List data sources (paginated)
- GET /data-sources/:id — Get single data source
- PATCH /data-sources/:id — Update data source
- DELETE /data-sources/:id — Delete data source
- POST /data-sources/:id/sync — Trigger sync
- POST /data-sources/:id/test-connection — Test connection

## Validation

- name: @IsString(), @MaxLength(255)
- type: @IsEnum(DataSourceType)
- connectionConfig: @IsObject()

## Access Control

- All endpoints require AuthGuard('jwt') and TenantGuard
- Only owner or admin can sync/test connection
- RLS ensures tenant isolation at database level

## Implementation Traceability

<!-- VERIFY:AE-DS-001 — DataSourceService create method -->
<!-- VERIFY:AE-DS-002 — DataSourceService findAll with pagination -->
<!-- VERIFY:AE-DS-003 — DataSourceService findOne by ID -->
<!-- VERIFY:AE-DS-004 — DataSourceService update method -->
<!-- VERIFY:AE-DS-005 — DataSourceService remove method -->
<!-- VERIFY:AE-DS-006 — DataSourceService sync with type branching -->
<!-- VERIFY:AE-DS-007 — DataSourceService testConnection per type -->
<!-- VERIFY:AE-DS-008 — DataSource audit logging -->
<!-- VERIFY:AE-DS-CTRL-001 — DataSource controller with CRUD + sync endpoints -->
<!-- VERIFY:AE-DS-DTO-001 — CreateDataSourceDto validation -->
<!-- VERIFY:AE-DS-DTO-002 — UpdateDataSourceDto validation -->
<!-- VERIFY:AE-DS-MOD-001 — DataSourceModule definition -->
<!-- VERIFY:DS-CTRL — DataSource controller implementation -->
<!-- VERIFY:DS-CTRL-TEST — DataSource controller unit tests -->
<!-- VERIFY:DS-DTO-CREATE — CreateDataSourceDto class -->
<!-- VERIFY:DS-DTO-UPDATE — UpdateDataSourceDto class -->
<!-- VERIFY:DS-INT-SUITE — DataSource integration test suite -->
<!-- VERIFY:DS-MOD — DataSource module definition -->
<!-- VERIFY:DS-SVC — DataSource service implementation -->
<!-- VERIFY:DS-SVC-TEST — DataSource service unit tests -->
