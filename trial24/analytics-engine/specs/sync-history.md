# Sync History Specification

## Overview

Sync history tracks data synchronization operations between data sources and
the analytics platform. Each record captures status, record count, timing,
and error messages. See [data-sources.md](data-sources.md) for parent data source.

## Service Layer

<!-- VERIFY:SYNC-SERVICE -->
The `SyncHistoryService` implements listing sync records by data source
(paginated), fetching individual records, and triggering new sync operations.
New syncs start with PENDING status and record count of 0.

## Controller Layer

<!-- VERIFY:SYNC-CONTROLLER -->
The `SyncHistoryController` maps HTTP methods to service operations:
- `GET /sync-histories/data-source/:dataSourceId` — List sync history for data source
- `GET /sync-histories/:id` — Get sync record by ID
- `POST /sync-histories/data-source/:dataSourceId/trigger` — Trigger new sync

## Database Operations

<!-- VERIFY:PRISMA-MODULE -->
The `PrismaModule` provides a singleton `PrismaService` that manages database
connections with tenant-scoped Row-Level Security. Before each query in
authenticated contexts, it sets the `app.tenant_id` PostgreSQL session variable.

## Seed Data

<!-- VERIFY:DB-SEED -->
The database seed script creates initial test data including sample users,
dashboards, widgets, data sources, and sync history records for development
and testing purposes.

## Business Rules

- New syncs start with PENDING status
- Record count defaults to 0
- completedAt is null until sync finishes
- Error messages captured on failure
- Status transitions: PENDING -> RUNNING -> COMPLETED/FAILED

## Cross-References

- Parent data source: see [data-sources.md](data-sources.md)
- Database module: see [infrastructure.md](infrastructure.md)
- Tenant isolation: see [security.md](security.md)

<!-- VERIFY:SYNC-HISTORY-CONTROLLER-SPEC -->
<!-- VERIFY:SYNC-HISTORY-SERVICE-SPEC -->
