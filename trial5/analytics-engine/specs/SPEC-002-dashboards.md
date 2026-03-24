# SPEC-002: Dashboards

> **Status:** APPROVED
> **Priority:** P0
> **Cross-references:** SPEC-004 (widgets), SPEC-006 (multi-tenancy)

## Overview

Dashboards are the primary container entity for analytics visualizations. Each
dashboard belongs to a tenant and contains zero or more widgets (see SPEC-004).
Dashboards have a lifecycle status: DRAFT, PUBLISHED, or ARCHIVED.

## Requirements

### Create Dashboard
<!-- VERIFY: dashboard-create -->
- POST /dashboards creates a new dashboard
- Requires ADMIN or USER role
- Accepts: title (required, max 255), description (optional, max 2000), status (optional, defaults to DRAFT)
- tenantId is extracted from JWT payload (not from request body)
- Returns the created dashboard object with 201 status

### List Dashboards
<!-- VERIFY: dashboard-list -->
- GET /dashboards returns paginated list of dashboards for the authenticated tenant
- Requires ADMIN, USER, or VIEWER role
- Supports page and limit query parameters
- Uses clampPagination from shared package (default 20, max 100)
- Returns { data: Dashboard[], meta: { total, page, limit, totalPages } }
- Ordered by createdAt descending

### Get Dashboard
<!-- VERIFY: dashboard-get -->
- GET /dashboards/:id returns a single dashboard with its widgets
- Requires ADMIN, USER, or VIEWER role
- Returns 404 if dashboard not found or belongs to a different tenant
- Includes related widgets in response

### Update Dashboard
<!-- VERIFY: dashboard-update -->
- PUT /dashboards/:id updates dashboard fields
- Requires ADMIN or USER role
- Accepts: title, description, status (all optional)
- Returns 404 if dashboard not found or belongs to different tenant
- Only updates fields that are provided

### Delete Dashboard
<!-- VERIFY: dashboard-delete -->
- DELETE /dashboards/:id removes a dashboard
- Requires ADMIN role only
- Returns 204 No Content on success
- Returns 404 if dashboard not found or belongs to different tenant

## Data Model
- id: UUID primary key
- title: string, required
- description: string, optional
- status: DashboardStatus enum (DRAFT, PUBLISHED, ARCHIVED)
- tenantId: foreign key to Tenant
- createdAt, updatedAt: timestamps
- Indexes on tenantId, status, and (tenantId, status) composite
