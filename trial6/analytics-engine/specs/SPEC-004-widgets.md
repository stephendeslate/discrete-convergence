# SPEC-004: Widgets

> **Status:** APPROVED
> **Priority:** P1
> **Cross-references:** SPEC-002 (dashboards)

## Overview

Widgets are visualization components that live within dashboards. Each widget
has a type (chart kind), title, and JSON configuration. Tenant isolation is
enforced indirectly through dashboard ownership (see SPEC-002).

## Requirements

### Create Widget
<!-- VERIFY: widget-create -->
- POST /widgets creates a new widget
- Requires ADMIN or USER role
- Accepts: type (required, one of LINE/BAR/PIE/AREA/KPI/TABLE/FUNNEL), title (required, max 255), config (optional JSON), dashboardId (required UUID)
- Verifies the target dashboard belongs to the authenticated tenant
- Returns 404 if dashboard not found or belongs to different tenant
- Returns the created widget with 201 status

### List Widgets
<!-- VERIFY: widget-list -->
- GET /widgets?dashboardId=xxx returns paginated widgets for a dashboard
- Requires ADMIN, USER, or VIEWER role
- dashboardId query parameter is required
- Verifies dashboard belongs to authenticated tenant
- Supports page and limit query parameters

### Get Widget
<!-- VERIFY: widget-get -->
- GET /widgets/:id returns a single widget
- Requires ADMIN, USER, or VIEWER role
- Verifies tenant ownership through dashboard relationship
- Returns 404 if not found or tenant mismatch

### Update Widget
<!-- VERIFY: widget-update -->
- PUT /widgets/:id updates widget fields
- Requires ADMIN or USER role
- Accepts: type, title, config (all optional)
- Verifies tenant ownership before update

### Delete Widget
<!-- VERIFY: widget-delete -->
- DELETE /widgets/:id removes a widget
- Requires ADMIN role only
- Returns 204 No Content on success

## Data Model
- id: UUID primary key
- type: WidgetType enum (LINE, BAR, PIE, AREA, KPI, TABLE, FUNNEL)
- title: string, required
- config: JSON, default {}
- dashboardId: foreign key to Dashboard
- createdAt, updatedAt: timestamps
- Index on dashboardId

## Verification Criteria

| VERIFY Tag | Assertion | Test Location |
|-----------|-----------|---------------|
| widget-create | POST verifies dashboard ownership, 404 for cross-tenant, all 7 types accepted | test/widget.service.spec.ts, test/widget-negative.spec.ts |
| widget-list | GET?dashboardId= verifies dashboard tenant, returns paginated widgets, empty for no widgets | test/widget.service.spec.ts, test/widget-negative.spec.ts |
| widget-get | GET /:id verifies tenant via dashboard chain, 404 for missing/cross-tenant | test/widget.service.spec.ts, test/widget-negative.spec.ts |
| widget-update | PUT /:id partial update, verifies ownership, 404 for cross-tenant | test/widget.service.spec.ts, test/widget-negative.spec.ts |
| widget-delete | DELETE /:id verifies ownership then deletes, 404 for cross-tenant | test/widget.service.spec.ts, test/widget-negative.spec.ts |
