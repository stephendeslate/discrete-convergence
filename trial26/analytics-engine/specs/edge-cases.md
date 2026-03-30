# Edge Cases Specification

## Overview

This document catalogs boundary conditions, error handling, and validation edge cases for the Analytics Engine platform.

## Authentication Edge Cases

<!-- VERIFY: AE-EDGE-001 — Empty dashboard name returns 400 bad request (boundary, invalid) -->
<!-- VERIFY: AE-EDGE-002 — Duplicate dashboard name for tenant returns 409 conflict (duplicate, conflict) -->
<!-- VERIFY: AE-EDGE-003 — Widget count exceeding maximum per dashboard returns 400 (boundary, overflow) -->
<!-- VERIFY: AE-EDGE-004 — Duplicate data source name returns 409 conflict (duplicate, conflict) -->
<!-- VERIFY: AE-EDGE-005 — Sync on paused data source returns 400 (error, invalid) -->
<!-- VERIFY: AE-EDGE-006 — Login with malformed email returns 400 (malformed, invalid) -->
<!-- VERIFY: AE-EDGE-007 — Registration with empty name returns 400 (empty, invalid, boundary) -->
<!-- VERIFY: AE-EDGE-008 — Unauthorized access returns 401 (unauthorized, forbidden) -->
<!-- VERIFY: AE-EDGE-009 — Invalid pagination parameters handled with boundary clamping (boundary, invalid) -->
<!-- VERIFY: AE-EDGE-010 — Not found for nonexistent resource returns 404 (not found, error) -->
<!-- VERIFY: AE-EDGE-011 — Publishing non-draft dashboard returns 400 (invalid, error) -->
<!-- VERIFY: AE-EDGE-012 — Archiving already archived dashboard returns 400 (duplicate, error) -->
<!-- VERIFY: AE-EDGE-013 — Syncing data source with exceeded failure threshold returns 400 (error, boundary) -->
<!-- VERIFY: AE-EDGE-014 — Widget without data source returns 400 on getData (null, error) -->
<!-- VERIFY: AE-EDGE-015 — Test connection on error state data source returns 400 (error, invalid) -->

## Dashboard Edge Cases

### Empty Name (AE-EDGE-001)
**Input:** POST /dashboards with name: ""
**Expected:** 400 Bad Request
**Test:** dashboard.service.spec.ts — "should throw BadRequestException for empty dashboard name"

### Duplicate Name (AE-EDGE-002)
**Input:** POST /dashboards with existing name for same tenant
**Expected:** 409 Conflict
**Test:** dashboard.service.spec.ts — "should throw ConflictException for duplicate dashboard name"

### Publish Non-Draft (AE-EDGE-011)
**Input:** PATCH /dashboards/:id/publish on PUBLISHED dashboard
**Expected:** 400 Bad Request
**Test:** dashboard.service.spec.ts — "should throw BadRequestException when publishing non-draft"

## Widget Edge Cases

### Max Widget Count (AE-EDGE-003)
**Input:** POST /dashboards/:id/widgets when 20 widgets already exist
**Expected:** 400 Bad Request — "Maximum 20 widgets per dashboard"
**Test:** widget.service.spec.ts — "should throw BadRequestException when widget count exceeds maximum"

### No Data Source (AE-EDGE-014)
**Input:** GET /widgets/:id/data when widget has no dataSourceId
**Expected:** 400 Bad Request
**Test:** widget.service.spec.ts — "should throw BadRequestException when widget has no data source"

## Data Source Edge Cases

### Duplicate Name (AE-EDGE-004)
**Input:** POST /data-sources with existing name for same tenant
**Expected:** 409 Conflict
**Test:** data-source.service.spec.ts — "should throw ConflictException for duplicate data source name"

### Sync Paused (AE-EDGE-005)
**Input:** POST /data-sources/:id/sync on PAUSED data source
**Expected:** 400 Bad Request
**Test:** data-source.service.spec.ts — "should throw BadRequestException when syncing paused data source"

### Failure Threshold (AE-EDGE-013)
**Input:** POST /data-sources/:id/sync with failureCount >= 5
**Expected:** 400 Bad Request
**Test:** data-source.service.spec.ts — "should throw BadRequestException when failure threshold exceeded"

## Security Edge Cases

### Unauthorized Access (AE-EDGE-008)
**Input:** GET /dashboards without Authorization header
**Expected:** 401 Unauthorized
**Test:** cross-layer.integration.spec.ts — "should return 401 for unauthorized access"

### Resource Not Found (AE-EDGE-010)
**Input:** GET /dashboards/nonexistent-id with valid token
**Expected:** 404 Not Found
**Test:** dashboard.integration.spec.ts — "should return not found for invalid id"
