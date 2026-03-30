# API Endpoints Specification

## Auth Endpoints

<!-- VERIFY: AE-AUTH-003 -->
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/register | Public | Register a new user |
| POST | /auth/login | Public | Login and receive JWT tokens |
| POST | /auth/refresh | Public | Refresh an expired access token |

## Dashboard Endpoints

<!-- VERIFY: AE-API-001 -->
| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | /dashboards | JWT | ADMIN, USER | Create a dashboard |
| GET | /dashboards | JWT | ADMIN, USER, VIEWER | List dashboards (paginated) |
| GET | /dashboards/:id | JWT | ADMIN, USER, VIEWER | Get dashboard by ID |
| PUT | /dashboards/:id | JWT | ADMIN, USER | Update a dashboard |
| DELETE | /dashboards/:id | JWT | ADMIN | Delete a dashboard |

## DataSource Endpoints

<!-- VERIFY: AE-API-002 -->
| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | /data-sources | JWT | ADMIN, USER | Create a data source |
| GET | /data-sources | JWT | ADMIN, USER, VIEWER | List data sources (paginated) |
| GET | /data-sources/:id | JWT | ADMIN, USER, VIEWER | Get data source by ID |
| PUT | /data-sources/:id | JWT | ADMIN, USER | Update a data source |
| DELETE | /data-sources/:id | JWT | ADMIN | Delete a data source |

## Widget Endpoints

<!-- VERIFY: AE-API-003 -->
| Method | Path | Auth | Roles | Description |
|--------|------|------|-------|-------------|
| POST | /widgets | JWT | ADMIN, USER | Create a widget |
| GET | /widgets?dashboardId=X | JWT | ADMIN, USER, VIEWER | List widgets for a dashboard |
| GET | /widgets/:id | JWT | ADMIN, USER, VIEWER | Get widget by ID |
| PUT | /widgets/:id | JWT | ADMIN, USER | Update a widget |
| DELETE | /widgets/:id | JWT | ADMIN | Delete a widget |

## Monitoring Endpoints

<!-- VERIFY: AE-MON-003 -->
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /monitoring/health | Public | Health check with DB status |
| GET | /monitoring/metrics | Public | Runtime metrics (memory, uptime) |

## Pagination

All list endpoints accept `page` and `limit` query parameters.
- Default page: 1
- Default limit: 20
- Max limit: 100

Response format:
```json
{
  "data": [...],
  "meta": { "total": 50, "page": 1, "limit": 20, "totalPages": 3 }
}
```

## DTO Validation

<!-- VERIFY: AE-API-004 -->
All request bodies are validated using class-validator decorators.
The ValidationPipe is configured with `whitelist: true` and `forbidNonWhitelisted: true`.
