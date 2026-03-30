# API Endpoints Specification

## Overview

The analytics engine exposes a RESTful API built on NestJS 11. All endpoints
are protected by JWT authentication unless marked as @Public().

Cross-reference: See [authentication.md](authentication.md) for auth flow details.
Cross-reference: See [security.md](security.md) for guard configuration.

## Authentication Endpoints

### POST /auth/login
- Public endpoint with @Throttle({short:{ttl:1000,limit:10}})
- Body: { email, password }
- Returns: { access_token, refresh_token }

### POST /auth/register
- Public endpoint with @Throttle({short:{ttl:1000,limit:10}})
- Body: { email, password, name, tenantName, role }
- Returns: { access_token, refresh_token }

### POST /auth/refresh
- Public endpoint
- Body: { refreshToken }
- Returns: { access_token, refresh_token }

## Dashboard Endpoints

### GET /dashboards
- Paginated list of tenant dashboards
- Query: page, limit

### POST /dashboards
- Create new dashboard (DRAFT status)
- Body: { title, description? }

### GET /dashboards/:id
- Get dashboard with widgets and embed config

### PUT /dashboards/:id
- Update dashboard title/description

### DELETE /dashboards/:id
- Delete dashboard (requires ADMIN or USER role)

### POST /dashboards/:id/publish
- Transition DRAFT -> PUBLISHED

### POST /dashboards/:id/archive
- Transition PUBLISHED -> ARCHIVED

## Widget Endpoints

### GET /dashboards/:dashboardId/widgets
### POST /dashboards/:dashboardId/widgets
### GET /dashboards/:dashboardId/widgets/:id
### PUT /dashboards/:dashboardId/widgets/:id
### DELETE /dashboards/:dashboardId/widgets/:id

## DataSource Endpoints

### GET /data-sources
### POST /data-sources
### GET /data-sources/:id
### PUT /data-sources/:id
### DELETE /data-sources/:id (ADMIN only)
### POST /data-sources/:id/sync
### GET /data-sources/:id/sync-history

## Data Endpoints

### GET /data/preview/:dataSourceId
### GET /data/widget/:dashboardId/:widgetId

## Embed Endpoints

### GET /embed/config/:dashboardId (Public)
### PUT /embed/config/:dashboardId
### GET /embed/stream/:dashboardId (Public, SSE)

## Other Endpoints

### GET /api-keys
### POST /api-keys
### DELETE /api-keys/:id
### GET /audit-log
### GET /health (Public)
### GET /health/ready (Public)
### GET /metrics (ADMIN only)

## VERIFY Tags

VERIFY: AE-DASH-005 — dashboard CRUD endpoints with tenant scoping
VERIFY: AE-WIDGET-004 — widget endpoints nested under dashboards
VERIFY: AE-DS-004 — data source endpoints with tier-based limits
VERIFY: AE-EMBED-003 — embed endpoints include SSE stream
