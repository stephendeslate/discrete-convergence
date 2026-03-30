# Sync History Specification

## Overview

Sync history records track data source synchronization events, providing
an audit trail of when data was fetched and any errors encountered.
This is a read-only domain — records are created by DataSourceService.sync()
and queried through dedicated endpoints.

## Domain Model

- **id** — UUID, primary key
- **dataSourceId** — FK to DataSource (cascade delete)
- **tenantId** — String (for RLS isolation)
- **status** — SyncStatus enum (pending, running, completed, failed)
- **recordCount** — Int, number of records processed (default 0)
- **errorMessage** — String (optional, populated on failure)
- **startedAt** — DateTime (default now())
- **completedAt** — DateTime (optional, set on completion or failure)

The SyncHistory model is mapped to the `sync_histories` table via `@@map`.

## Status Lifecycle

1. **PENDING** — Sync requested, not yet started
2. **RUNNING** — Sync in progress, created by DataSourceService.sync()
3. **COMPLETED** — Sync finished successfully with recordCount populated
4. **FAILED** — Sync encountered an error, errorMessage populated

The SyncStatus enum maps to lowercase values via `@@map("sync_status")`.

## API Endpoints

- `GET /sync-history` — List sync records (paginated, tenant-scoped)
- `GET /sync-history/:id` — Get single sync record with dataSource included

Read-only endpoints; sync records are created by DataSourceService.sync().

## Service Layer

SyncHistoryService methods:
- `findAll(tenantId, page, limit)` — Paginated list filtered by tenant,
  ordered by startedAt DESC, includes related dataSource
- `findOne(id, tenantId)` — Single record lookup
  (findFirst justified: lookup by ID within tenant scope)

Both methods throw NotFoundException when no matching record exists.

## Query Patterns

- Default sort: startedAt DESC (most recent first)
- Includes dataSource relation for context in list views
- Filter by dataSourceId for data source detail view
- Pagination via clampPagination from @repo/shared
- Indexes on tenantId and dataSourceId for query performance

## Access Control

- All endpoints require AuthGuard('jwt') and TenantGuard
- Read-only access for all authenticated tenant users
- RLS ensures tenant isolation at database level
- No write endpoints exposed — creation is internal only

<!-- VERIFY:SYNC-READONLY — Sync history is read-only via API -->
<!-- VERIFY:SYNC-TENANT-SCOPE — Sync history scoped to tenant -->

## Implementation Traceability

<!-- VERIFY:AE-SH-001 — SyncHistoryService findAll with pagination -->
<!-- VERIFY:AE-SH-002 — SyncHistoryService findOne by ID -->
<!-- VERIFY:AE-SH-003 — SyncHistory tenant scoping -->
<!-- VERIFY:AE-SH-CTRL-001 — SyncHistory controller with list endpoints -->
<!-- VERIFY:AE-SH-MOD-001 — SyncHistoryModule definition -->
<!-- VERIFY:AE-SHARED-001 — Shared package exports -->
<!-- VERIFY:SYNC-CTRL — SyncHistory controller implementation -->
<!-- VERIFY:SYNC-CTRL-TEST — SyncHistory controller unit tests -->
<!-- VERIFY:SYNC-MOD — SyncHistory module definition -->
<!-- VERIFY:SYNC-SVC — SyncHistory service implementation -->
<!-- VERIFY:SYNC-SVC-TEST — SyncHistory service unit tests -->
<!-- VERIFY:SHARED-CORR — Shared correlation ID utility -->
<!-- VERIFY:SHARED-INDEX-TEST — Shared package index tests -->

## Cross-References

- See also: [data-sources.md](data-sources.md) — DataSourceService.sync() creates sync records
- See also: [data-model.md](data-model.md) — SyncHistory model and SyncStatus enum
- See also: [api-endpoints.md](api-endpoints.md) — sync history API endpoint details
