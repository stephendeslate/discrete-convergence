# Widgets Specification

## Overview

Widgets are visual components placed on dashboards. Each widget has a type
(chart, table, metric, text) that determines its rendering and data behavior.

## Domain Model

- id: UUID
- name: String (required, max 255 chars)
- type: WidgetType enum (chart, table, metric, text)
- config: Json (widget-specific configuration)
- dashboardId: FK to Dashboard (UUID, max 36 chars)
- dataSourceId: FK to DataSource (optional)
- tenantId: String (for RLS)

## Widget Types

### Chart Widget
- Renders data as bar, line, or pie chart
- Config includes: chartType, xAxis, yAxis, colors

### Table Widget
- Renders tabular data with columns
- Config includes: columns, sortBy, pageSize

### Metric Widget
- Shows single KPI value with optional trend
- Config includes: label, format, thresholds

### Text Widget
- Static text/markdown content
- Config includes: content, alignment

## Data Retrieval

getWidgetData method uses switch/case branching by widget type:
- chart: Aggregates data from data source
- table: Queries raw data with pagination
- metric: Computes single metric value
- text: Returns static content from config
- default: Throws BadRequestException for unknown types

<!-- VERIFY:WIDGET-DATA-BRANCHING — getWidgetData uses switch/case by type -->
<!-- VERIFY:WIDGET-TYPES — All 4 widget types handled -->

## CRUD Operations

- POST /widgets — Create widget (requires dashboardId)
- GET /widgets — List widgets (paginated, tenant-scoped)
- GET /widgets/:id — Get single widget
- PATCH /widgets/:id — Update widget
- DELETE /widgets/:id — Delete widget
- GET /widgets/:id/data — Get widget data (type-specific)

## Validation

- name: @IsString(), @MaxLength(255)
- type: @IsEnum(WidgetType)
- config: @IsObject()
- dashboardId: @IsString(), @MaxLength(36)
- dataSourceId: @IsOptional(), @IsString(), @MaxLength(36)

## Access Control

- All endpoints require AuthGuard('jwt') and TenantGuard
- Widget inherits access from parent dashboard
- RLS ensures tenant isolation at database level

## Implementation Traceability

<!-- VERIFY:AE-WID-001 — WidgetService create method -->
<!-- VERIFY:AE-WID-002 — WidgetService findAll with pagination -->
<!-- VERIFY:AE-WID-003 — WidgetService findOne by ID -->
<!-- VERIFY:AE-WID-004 — WidgetService update method -->
<!-- VERIFY:AE-WID-005 — WidgetService remove method -->
<!-- VERIFY:AE-WID-006 — WidgetService getWidgetData with type branching -->
<!-- VERIFY:AE-WID-007 — Widget audit logging -->
<!-- VERIFY:AE-WID-CTRL-001 — Widget controller with CRUD endpoints -->
<!-- VERIFY:AE-WID-DTO-001 — CreateWidgetDto validation -->
<!-- VERIFY:AE-WID-DTO-002 — UpdateWidgetDto validation -->
<!-- VERIFY:AE-WID-MOD-001 — WidgetModule definition -->
<!-- VERIFY:WIDGET-CTRL — Widget controller implementation -->
<!-- VERIFY:WIDGET-CTRL-TEST — Widget controller unit tests -->
<!-- VERIFY:WIDGET-DTO-CREATE — CreateWidgetDto class -->
<!-- VERIFY:WIDGET-DTO-UPDATE — UpdateWidgetDto class -->
<!-- VERIFY:WIDGET-INT-SUITE — Widget integration test suite -->
<!-- VERIFY:WIDGET-MOD — Widget module definition -->
<!-- VERIFY:WIDGET-SVC — Widget service implementation -->
<!-- VERIFY:WIDGET-SVC-TEST — Widget service unit tests -->
