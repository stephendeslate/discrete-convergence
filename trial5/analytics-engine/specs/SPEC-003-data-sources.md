# SPEC-003: Data Sources

> **Status:** APPROVED
> **Priority:** P0
> **Cross-references:** SPEC-006 (multi-tenancy)

## Overview

Data sources represent external data connections that feed analytics dashboards.
Each data source belongs to a tenant and tracks sync runs for data ingestion.

## Requirements

### Create Data Source
<!-- VERIFY: data-source-create -->
- POST /data-sources creates a new data source
- Requires ADMIN or USER role
- Accepts: name (required, max 255), type (required, one of POSTGRES/MYSQL/REST_API/CSV), config (optional JSON)
- tenantId is extracted from JWT payload
- Returns the created data source with 201 status

### List Data Sources
<!-- VERIFY: data-source-list -->
- GET /data-sources returns paginated list for the authenticated tenant
- Requires ADMIN, USER, or VIEWER role
- Supports page and limit query parameters
- Returns { data: DataSource[], meta: { total, page, limit, totalPages } }

### Get Data Source
<!-- VERIFY: data-source-get -->
- GET /data-sources/:id returns a single data source with recent sync runs
- Requires ADMIN, USER, or VIEWER role
- Includes last 10 sync runs ordered by createdAt descending
- Returns 404 if not found or belongs to different tenant

### Update Data Source
<!-- VERIFY: data-source-update -->
- PUT /data-sources/:id updates data source fields
- Requires ADMIN or USER role
- Accepts: name, type, config (all optional)
- Returns 404 if not found or belongs to different tenant

### Delete Data Source
<!-- VERIFY: data-source-delete -->
- DELETE /data-sources/:id removes a data source
- Requires ADMIN role only
- Returns 204 No Content on success

## Data Model
- id: UUID primary key
- name: string, required
- type: DataSourceType enum (POSTGRES, MYSQL, REST_API, CSV)
- config: JSON, default {}
- tenantId: foreign key to Tenant
- createdAt, updatedAt: timestamps
- Indexes on tenantId and (tenantId, type) composite
