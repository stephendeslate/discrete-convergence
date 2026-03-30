# API Endpoints Specification

## Overview

The Analytics Engine API exposes REST endpoints via NestJS controllers. All
endpoints except health checks and auth require JWT authentication. Responses
include correlation IDs and response time headers.

## Edge Case Handling

<!-- VERIFY:TEST-EDGE-CASES -->
Edge case tests verify boundary conditions: empty strings rejected, UUIDs
validated via ParseUUIDPipe, pagination clamped to valid ranges, and missing
required fields return 400 with descriptive messages.

## Performance Requirements

<!-- VERIFY:TEST-PERFORMANCE -->
Performance tests verify that response time headers are present, that health
endpoints respond within acceptable latency, and that concurrent requests
are handled without errors under load.

## Test Infrastructure

<!-- VERIFY:TEST-HELPERS -->
Shared test utilities provide helper functions for creating test applications,
generating auth tokens, and making authenticated requests. These are used
across all integration test suites.

## Endpoint Summary

| Method | Path | Auth | Controller |
|--------|------|------|------------|
| POST | /auth/register | No | AuthController |
| POST | /auth/login | No | AuthController |
| POST | /auth/refresh | Yes | AuthController |
| GET | /dashboards | Yes | DashboardController |
| POST | /dashboards | Yes | DashboardController |
| GET | /dashboards/:id | Yes | DashboardController |
| PUT | /dashboards/:id | Yes | DashboardController |
| DELETE | /dashboards/:id | Yes | DashboardController |
| GET | /widgets/dashboard/:id | Yes | WidgetController |
| POST | /widgets | Yes | WidgetController |
| GET | /widgets/:id | Yes | WidgetController |
| PUT | /widgets/:id | Yes | WidgetController |
| DELETE | /widgets/:id | Yes | WidgetController |
| GET | /data-sources | Yes | DataSourceController |
| POST | /data-sources | Yes | DataSourceController |
| GET | /data-sources/:id | Yes | DataSourceController |
| PUT | /data-sources/:id | Yes | DataSourceController |
| DELETE | /data-sources/:id | Yes | DataSourceController |
| GET | /sync-histories/data-source/:id | Yes | SyncHistoryController |
| GET | /sync-histories/:id | Yes | SyncHistoryController |
| POST | /sync-histories/data-source/:id/trigger | Yes | SyncHistoryController |
| GET | /audit-logs | Yes | AuditLogController |
| GET | /health | No | MonitoringController |
| GET | /health/ready | No | MonitoringController |
| GET | /health/metrics | No | MonitoringController |

## Request/Response Conventions

- All list endpoints support `page` and `pageSize` query parameters
- UUID path parameters validated via `ParseUUIDPipe`
- Error responses use consistent shape: { statusCode, message, error, timestamp, correlationId }
- Success responses for lists include: { data, total, page, pageSize, totalPages }

## Cross-References

- Authentication endpoints: see [authentication.md](authentication.md)
- Dashboard endpoints: see [dashboards.md](dashboards.md)
- Widget endpoints: see [widgets.md](widgets.md)
- Data source endpoints: see [data-sources.md](data-sources.md)
- Health endpoints: see [monitoring.md](monitoring.md)

<!-- VERIFY:PAGINATED-QUERY-SPEC -->
