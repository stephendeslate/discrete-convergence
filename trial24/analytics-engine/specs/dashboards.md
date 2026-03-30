# Dashboard Specification

## Overview

Dashboards are the primary container for analytics widgets. Each dashboard is
owned by a user and scoped to a tenant. Only the owner can modify or delete
their dashboards. See [widgets.md](widgets.md) for widget management.

## Service Layer

<!-- VERIFY:DASHBOARD-SERVICE -->
The `DashboardService` implements CRUD operations for dashboards. It enforces
ownership checks on update and delete operations, throwing ForbiddenException
when a non-owner attempts modification. List operations use pagination utilities.

<!-- VERIFY:TEST-DASHBOARD-SERVICE -->
Unit tests for `DashboardService` cover creation, listing with pagination,
findOne with widget includes, update with ownership validation, and deletion.

## Controller Layer

<!-- VERIFY:DASHBOARD-CONTROLLER -->
The `DashboardController` maps HTTP methods to service operations:
- `GET /dashboards` — List all dashboards for tenant (paginated)
- `POST /dashboards` — Create dashboard (name, description?, isPublic?)
- `GET /dashboards/:id` — Get dashboard with associated widgets
- `PUT /dashboards/:id` — Update dashboard (owner only)
- `DELETE /dashboards/:id` — Delete dashboard (owner only)

## Data Transfer Objects

<!-- VERIFY:DASHBOARD-DTO -->
Dashboard DTOs define validation rules: name is required (max 255 chars),
description is optional, isPublic defaults to false. Create and update DTOs
share the same validation constraints.

## Integration Tests

<!-- VERIFY:TEST-DASHBOARD-INTEGRATION -->
Integration tests verify the full HTTP lifecycle for dashboard CRUD including
authentication requirements, ownership enforcement, and pagination behavior.

## Business Rules

- Name is required, max 255 characters
- isPublic defaults to false
- Deleting a dashboard cascades to its widgets
- ForbiddenException thrown when non-owner attempts modification
- List results are paginated using shared pagination utilities

## Cross-References

- Widget management within dashboards: see [widgets.md](widgets.md)
- Authentication requirements: see [authentication.md](authentication.md)
- Pagination utilities: see [api-endpoints.md](api-endpoints.md)

<!-- VERIFY:DASHBOARD-CONTROLLER-SPEC -->
