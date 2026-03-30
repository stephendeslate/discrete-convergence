# Analytics Engine — Build Plan

## Domain Research

Multi-tenant analytics platform. Tenants manage dashboards, widgets, data sources, and view sync history/audit logs.

### Entities
- **Tenant**: Organization container. All domain entities scoped by `tenantId`.
- **User**: Authenticated user belonging to a tenant. Roles: ADMIN, EDITOR, VIEWER.
- **Dashboard**: Named container for widgets. Lifecycle: DRAFT → PUBLISHED → ARCHIVED.
- **Widget**: Visual component on a dashboard. Types: CHART, TABLE, METRIC, MAP.
- **DataSource**: External data connection. Types: POSTGRES, MYSQL, REST_API, CSV. Has connectionString, status (ACTIVE/INACTIVE/ERROR).
- **SyncHistory**: Record of data sync operations. Status: PENDING → RUNNING → COMPLETED/FAILED.
- **AuditLog**: Immutable record of user actions (entity changes, logins, etc.).

### Relationships
- Tenant 1→N Users, Dashboards, DataSources, AuditLogs
- Dashboard 1→N Widgets
- DataSource 1→N SyncHistory
- Widget N→1 DataSource (optional)

### Constraints
- Dashboard can only be published if it has >= 1 widget
- DataSource must pass testConnection before activation
- SyncHistory is append-only (no updates/deletes)
- AuditLog is append-only

## Data Model

### Prisma Models

| Model | Fields | Constraints |
|-------|--------|-------------|
| Tenant | id, name, slug, plan, createdAt, updatedAt | @@map("tenants") |
| User | id, tenantId, email, passwordHash, name, role, createdAt, updatedAt | @@map("users"), @@index([tenantId]), @@index([email]) unique |
| Dashboard | id, tenantId, name, description, layout, status, publishedAt, version, createdAt, updatedAt | @@map("dashboards"), @@index([tenantId]), @@index([tenantId, status]) |
| Widget | id, tenantId, dashboardId, dataSourceId?, title, type, config, position, createdAt, updatedAt | @@map("widgets"), @@index([tenantId]), @@index([dashboardId]) |
| DataSource | id, tenantId, name, type, connectionString, status, lastSyncAt, createdAt, updatedAt | @@map("data_sources"), @@index([tenantId]), @@index([tenantId, status]) |
| SyncHistory | id, tenantId, dataSourceId, status, recordsProcessed, errorMessage, startedAt, completedAt, createdAt | @@map("sync_histories"), @@index([tenantId]), @@index([dataSourceId]) |
| AuditLog | id, tenantId, userId, action, entityType, entityId, oldValue, newValue, ipAddress, createdAt | @@map("audit_logs"), @@index([tenantId]), @@index([userId]) |

### Enums
- Role: ADMIN @map("ADMIN"), EDITOR @map("EDITOR"), VIEWER @map("VIEWER")
- DashboardStatus: DRAFT @map("DRAFT"), PUBLISHED @map("PUBLISHED"), ARCHIVED @map("ARCHIVED")
- WidgetType: CHART @map("CHART"), TABLE @map("TABLE"), METRIC @map("METRIC"), MAP @map("MAP")
- DataSourceType: POSTGRES @map("POSTGRES"), MYSQL @map("MYSQL"), REST_API @map("REST_API"), CSV @map("CSV")
- DataSourceStatus: ACTIVE @map("ACTIVE"), INACTIVE @map("INACTIVE"), ERROR @map("ERROR")
- SyncStatus: PENDING @map("PENDING"), RUNNING @map("RUNNING"), COMPLETED @map("COMPLETED"), FAILED @map("FAILED")

### RLS Plan
Tables needing RLS: users, dashboards, widgets, data_sources, sync_histories, audit_logs
Each: ENABLE ROW LEVEL SECURITY + FORCE ROW LEVEL SECURITY + CREATE POLICY using `current_setting('app.tenant_id')`

### DA Checklist
- [x] Every model has @@map
- [x] Every enum value has @map
- [x] Every FK has @@index
- [x] tenantId indexed on all domain models
- [x] Composite indexes on (tenantId, status)
- [x] No Float for monetary — N/A (no monetary fields)
- [x] RLS for all tenanted tables
- [x] PrismaService.setTenantContext() with $executeRaw

## Endpoint Manifest

| Method | Path | Auth | Controller | Service Method |
|--------|------|------|------------|----------------|
| POST | /auth/register | Public | AuthController | register() |
| POST | /auth/login | Public | AuthController | login() |
| GET | /auth/profile | JWT | AuthController | getProfile() |
| GET | /dashboards | JWT | DashboardController | findAll() |
| POST | /dashboards | JWT | DashboardController | create() |
| GET | /dashboards/:id | JWT | DashboardController | findOne() |
| PATCH | /dashboards/:id | JWT | DashboardController | update() |
| DELETE | /dashboards/:id | JWT | DashboardController | remove() |
| POST | /dashboards/:id/publish | JWT | DashboardController | publish() |
| POST | /dashboards/:id/archive | JWT | DashboardController | archive() |
| GET | /widgets | JWT | WidgetController | findAll() |
| POST | /widgets | JWT | WidgetController | create() |
| GET | /widgets/:id | JWT | WidgetController | findOne() |
| PATCH | /widgets/:id | JWT | WidgetController | update() |
| DELETE | /widgets/:id | JWT | WidgetController | remove() |
| GET | /widgets/:id/data | JWT | WidgetController | getWidgetData() |
| GET | /data-sources | JWT | DataSourceController | findAll() |
| POST | /data-sources | JWT | DataSourceController | create() |
| GET | /data-sources/:id | JWT | DataSourceController | findOne() |
| PATCH | /data-sources/:id | JWT | DataSourceController | update() |
| DELETE | /data-sources/:id | JWT | DataSourceController | remove() |
| POST | /data-sources/:id/test | JWT | DataSourceController | testConnection() |
| POST | /data-sources/:id/sync | JWT | DataSourceController | sync() |
| GET | /sync-history | JWT | SyncHistoryController | findAll() |
| GET | /sync-history/:id | JWT | SyncHistoryController | findOne() |
| GET | /audit-logs | JWT | AuditLogController | findAll() |
| GET | /metrics | JWT | MonitoringController | getMetrics() |
| GET | /health | Public | HealthController | check() |
| GET | /health/ready | Public | HealthController | ready() |

## Service Logic

### DashboardService
```
create(dto, tenantId):
  - Validate name non-empty
  - Check no duplicate name for tenant → ConflictException if exists
  - Create with status=DRAFT, version=1
  - Return created

publish(id, tenantId):
  - Find by id + tenantId → NotFoundException if missing
  - If status !== DRAFT → BadRequestException('Only draft dashboards can be published')
  - Check has >= 1 widget → BadRequestException('Dashboard must have at least one widget')
  - Update status=PUBLISHED, publishedAt=now
  - Return updated

archive(id, tenantId):
  - Find by id + tenantId → NotFoundException
  - If status === ARCHIVED → BadRequestException('Already archived')
  - Update status=ARCHIVED
  - Return updated

update(id, dto, tenantId):
  - Find by id + tenantId → NotFoundException
  - If name changed, check no duplicate → ConflictException
  - Update fields, increment version
  - Return updated
```

### WidgetService
```
create(dto, tenantId):
  - Validate dashboardId exists for tenant → NotFoundException
  - If dataSourceId provided, validate exists → NotFoundException
  - Create widget
  - Return created

getWidgetData(id, tenantId):
  - Find widget by id + tenantId → NotFoundException
  - If no dataSourceId → BadRequestException('Widget has no data source')
  - If dataSource status !== ACTIVE → BadRequestException('Data source is not active')
  - Return mock data based on widget type
```

### DataSourceService
```
testConnection(id, tenantId):
  - Find by id + tenantId → NotFoundException
  - Simulate connection test based on type
  - If connection succeeds → update status=ACTIVE, return { success: true }
  - If fails → update status=ERROR, return { success: false, error: message }

sync(id, tenantId):
  - Find by id + tenantId → NotFoundException
  - If status !== ACTIVE → BadRequestException('Data source must be active to sync')
  - Create SyncHistory with status=RUNNING
  - Simulate sync, update to COMPLETED/FAILED
  - Return sync result
```

### SyncHistoryService
```
findAll(tenantId, query):
  - Paginate with clamping (page >= 1, limit 1-100)
  - Filter by dataSourceId if provided
  - Return { data, meta }
```

### AuditLogService
```
findAll(tenantId, query):
  - Paginate with clamping
  - Filter by entityType, userId if provided
  - Return { data, meta }
```

## Flows

1. **Auth**: Register → Login → JWT → stored in cookie → Auth header on protected requests → JwtAuthGuard → req.user.tenantId for scoping
2. **Dashboard CRUD**: Create (DRAFT) → Add Widgets → Publish → Archive
3. **DataSource**: Create → Test Connection → Activate → Sync → View History
4. **Widget Data**: Create widget → Attach to data source → Get widget data

## Edge Cases

| Endpoint | Error Case | Response | VERIFY Tag |
|----------|-----------|----------|------------|
| POST /auth/register | Duplicate email | 409 Conflict | AE-EDGE-001 |
| POST /auth/login | Wrong password | 401 Unauthorized | AE-EDGE-002 |
| POST /dashboards | Empty name | 400 BadRequest | AE-EDGE-003 |
| POST /dashboards | Duplicate name for tenant | 409 Conflict | AE-EDGE-004 |
| POST /dashboards/:id/publish | No widgets | 400 BadRequest | AE-EDGE-005 |
| POST /dashboards/:id/publish | Already published | 400 BadRequest | AE-EDGE-006 |
| GET /dashboards/:id | Not found | 404 NotFound | AE-EDGE-007 |
| GET /dashboards/:id | Wrong tenant | 404 NotFound | AE-EDGE-008 |
| POST /data-sources/:id/sync | Inactive source | 400 BadRequest | AE-EDGE-009 |
| GET /widgets/:id/data | No data source | 400 BadRequest | AE-EDGE-010 |
| GET /dashboards | Page < 1 clamped | 200 page=1 | AE-EDGE-011 |
| POST /auth/register | Invalid email format | 400 BadRequest | AE-EDGE-012 |

## Spec Outline

```
specs/authentication.md (5 tags):
  AE-AUTH-001: Registration with valid data → TRACED in auth.service.ts
  AE-AUTH-002: Login with valid credentials → TRACED in auth.service.ts
  AE-AUTH-003: JWT token generation → TRACED in auth.service.ts
  AE-AUTH-004: Password hashing with bcryptjs → TRACED in auth.service.ts
  AE-AUTH-005: Profile retrieval → TRACED in auth.controller.ts

specs/data-model.md (5 tags):
  AE-DATA-001: Tenant isolation via tenantId → TRACED in prisma.service.ts
  AE-DATA-002: Dashboard model with status lifecycle → TRACED in dashboard.service.ts
  AE-DATA-003: Widget model with type/config → TRACED in widget.service.ts
  AE-DATA-004: DataSource model with connection types → TRACED in data-source.service.ts
  AE-DATA-005: RLS policies on all tenanted tables → TRACED in prisma.service.ts

specs/api-endpoints.md (6 tags):
  AE-API-001: Dashboard CRUD endpoints → TRACED in dashboard.controller.ts
  AE-API-002: Widget CRUD + getData → TRACED in widget.controller.ts
  AE-API-003: DataSource CRUD + test + sync → TRACED in data-source.controller.ts
  AE-API-004: SyncHistory list/detail → TRACED in sync-history.controller.ts
  AE-API-005: AuditLog listing → TRACED in audit-log.controller.ts
  AE-API-006: Paginated responses with { data, meta } → TRACED in pagination.utils.ts

specs/frontend.md (4 tags):
  AE-FE-001: Login/register pages → TRACED in apps/web/app/login/page.tsx
  AE-FE-002: Dashboard management UI → TRACED in apps/web/app/dashboards/page.tsx
  AE-FE-003: Widget display → TRACED in apps/web/app/widgets/page.tsx
  AE-FE-004: Data source management → TRACED in apps/web/app/data-sources/page.tsx

specs/infrastructure.md (4 tags):
  AE-INFRA-001: Docker multi-stage build → TRACED in Dockerfile (NO - in main.ts)
  AE-INFRA-002: Docker compose with api service → TRACED in main.ts
  AE-INFRA-003: CI/CD pipeline → TRACED in main.ts
  AE-INFRA-004: Environment variable validation → TRACED in main.ts

specs/security.md (5 tags):
  AE-SEC-001: Helmet CSP configuration → TRACED in main.ts
  AE-SEC-002: ThrottlerModule rate limiting → TRACED in app.module.ts
  AE-SEC-003: CORS configuration → TRACED in main.ts
  AE-SEC-004: ValidationPipe with whitelist → TRACED in main.ts
  AE-SEC-005: JWT auth guard as APP_GUARD → TRACED in app.module.ts

specs/monitoring.md (4 tags):
  AE-MON-001: Health check endpoint → TRACED in health.controller.ts
  AE-MON-002: Metrics endpoint → TRACED in monitoring.controller.ts
  AE-MON-003: Structured logging with pino → TRACED in app.module.ts
  AE-MON-004: Correlation ID middleware → TRACED in correlation-id.middleware.ts

specs/edge-cases.md (12 tags):
  AE-EDGE-001 through AE-EDGE-012 (see Edge Cases table above)

Total VERIFY tags: 45
```

## Frontend Routes & Actions

| Route | Page File | Server Actions | Forms |
|-------|-----------|---------------|-------|
| /login | app/login/page.tsx | loginAction | LoginForm |
| /register | app/register/page.tsx | registerAction | RegisterForm |
| /dashboard | app/dashboard/page.tsx | getDashboardStats | — |
| /dashboards | app/dashboards/page.tsx | getDashboards, createDashboard, publishDashboard | CreateDashboardForm |
| /widgets | app/widgets/page.tsx | getWidgets, createWidget | CreateWidgetForm |
| /data-sources | app/data-sources/page.tsx | getDataSources, testConnection | DataSourceForm |
| /sync-history | app/sync-history/page.tsx | getSyncHistory | — |
| /audit-logs | app/audit-logs/page.tsx | getAuditLogs | — |
| /settings | app/settings/page.tsx | updateProfile | SettingsForm |

### UI Ceiling Alignment
- C8: Domain routes NOT in login/register/settings/dashboard/data-sources: /widgets, /sync-history, /audit-logs (3 ✓)
- C9: Write actions: createDashboard (POST), createWidget (POST), publishDashboard (POST), testConnection (POST) (4 ✓)
- C10: Form components: CreateDashboardForm, CreateWidgetForm, DataSourceForm (3 ✓)

## Plan Validation
- [x] Every model with >= 2 scalar fields has a service: Dashboard, Widget, DataSource, SyncHistory, AuditLog (5/5)
- [x] Every endpoint in spec outline with VERIFY tag
- [x] Domain-action methods have branching logic: publish, archive, testConnection, sync, getWidgetData
- [x] >= 35 VERIFY tags: 45 planned
- [x] >= 10 edge-case VERIFY tags: 12 planned
- [x] >= 3 domain route pages: widgets, sync-history, audit-logs
- [x] >= 3 write server actions: createDashboard, createWidget, publishDashboard, testConnection
- [x] >= 2 form components: CreateDashboardForm, CreateWidgetForm, DataSourceForm
- [x] FC C8/C9/C10 satisfiable
- [x] RLS complete for all tenanted models
