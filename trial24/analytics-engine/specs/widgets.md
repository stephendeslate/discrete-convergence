# Widget Specification

## Overview

Widgets are visualization components placed within dashboards. Each widget has
a type (e.g., line-chart, bar-chart), a JSON configuration object, and a
position field for ordering. See [dashboards.md](dashboards.md) for the parent container.

## Service Layer

<!-- VERIFY:WIDGET-SERVICE -->
The `WidgetService` implements CRUD operations for widgets. It queries widgets
scoped to tenant and optionally filtered by dashboardId. Create operations
set default values for config ({}) and position (0).

<!-- VERIFY:TEST-WIDGET-SERVICE -->
Unit tests for `WidgetService` cover creation with defaults, listing by
dashboard, findOne, update, and deletion including tenant scoping.

## Controller Layer

<!-- VERIFY:WIDGET-CONTROLLER -->
The `WidgetController` maps HTTP methods to service operations:
- `GET /widgets/dashboard/:dashboardId` — List widgets for a dashboard (paginated)
- `POST /widgets` — Create widget (title, type, dashboardId, config?, position?)
- `GET /widgets/:id` — Get widget by ID
- `PUT /widgets/:id` — Update widget
- `DELETE /widgets/:id` — Delete widget

## Data Transfer Objects

<!-- VERIFY:WIDGET-DTO -->
Widget DTOs define validation: title (required, max 255), type (required, max 50),
dashboardId (required UUID), config (optional JSON), position (optional integer).

## Business Rules

- Title max 255 chars, type max 50 chars
- Config defaults to empty object {}
- Position defaults to 0
- Cascade delete when parent dashboard is removed
- All queries scoped by tenantId

## Cross-References

- Parent dashboard: see [dashboards.md](dashboards.md)
- Data model: see [data-model.md](data-model.md)
- Authentication: see [authentication.md](authentication.md)

<!-- VERIFY:WIDGET-CONTROLLER-SPEC -->
