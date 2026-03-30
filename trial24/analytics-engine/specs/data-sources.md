# Data Source Specification

## Overview

Data sources represent external database or API connections that feed data into
the analytics platform. Each data source has a connection string, type, and
active status. See [sync-history.md](sync-history.md) for sync operations.

## Service Layer

<!-- VERIFY:DATASOURCE-SERVICE -->
The `DataSourceService` implements CRUD operations for data sources. It supports
listing with pagination, creation with defaults (isActive=true), and cascading
deletion that removes associated sync history records.

<!-- VERIFY:TEST-DATASOURCE-SERVICE -->
Unit tests for `DataSourceService` cover CRUD operations, pagination, active
status toggling, and tenant-scoped queries.

## Controller Layer

<!-- VERIFY:DATASOURCE-CONTROLLER -->
The `DataSourceController` maps HTTP methods to service operations:
- `GET /data-sources` — List data sources (paginated, tenant-scoped)
- `POST /data-sources` — Create data source (name, type, connectionString)
- `GET /data-sources/:id` — Get data source by ID
- `PUT /data-sources/:id` — Update data source
- `DELETE /data-sources/:id` — Delete data source (cascades sync history)

## Data Transfer Objects

<!-- VERIFY:DATASOURCE-DTO -->
Data source DTOs define validation: name (required), type (required),
connectionString (required), isActive (optional boolean, defaults to true).

## Integration Tests

<!-- VERIFY:TEST-DATASOURCE-INTEGRATION -->
Integration tests verify the full HTTP lifecycle for data source CRUD including
authentication requirements, pagination, and cascade deletion behavior.

## Business Rules

- Connection strings stored as-is (encryption is a future enhancement)
- isActive defaults to true
- Deleting a data source cascades to its sync histories
- All queries scoped by tenantId

## Cross-References

- Sync operations: see [sync-history.md](sync-history.md)
- Authentication: see [authentication.md](authentication.md)
- Data model: see [data-model.md](data-model.md)

<!-- VERIFY:DATASOURCE-CONTROLLER-SPEC -->
