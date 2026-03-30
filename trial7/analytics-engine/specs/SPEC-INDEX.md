# Analytics Engine — Specification Index

## Project Information

- **Project:** Analytics Engine (AE)
- **Domain:** Real-time analytics dashboard platform
- **Trial:** 7 (discrete-convergence experiment)
- **Methodology:** CED v0.7-dc
- **Version:** 1.0.0

## Specification Documents

| Document | Description | Layer |
|----------|-------------|-------|
| [authentication.md](authentication.md) | JWT auth, registration, login, token flow | L0 |
| [data-model.md](data-model.md) | Prisma schema, entities, enums, indexes, RLS | L0 |
| [api-endpoints.md](api-endpoints.md) | REST endpoints, DTOs, pagination, RBAC | L0 |
| [frontend.md](frontend.md) | Next.js pages, shadcn/ui, loading/error states | L2 |
| [infrastructure.md](infrastructure.md) | Docker, CI/CD, migrations, seed, monorepo | L4 |
| [security.md](security.md) | Guards, CSP, rate limiting, CORS, validation | L6 |
| [monitoring.md](monitoring.md) | Logging, correlation IDs, health, metrics | L8 |
| [cross-layer.md](cross-layer.md) | Integration pipeline, shared package, full test | L9 |

## Domain Entities

- **Tenant:** Multi-tenant isolation boundary
- **User:** Authenticated user with roles (ADMIN, USER, VIEWER)
- **Dashboard:** Analytics container (ACTIVE, ARCHIVED, DRAFT)
- **Widget:** Visual component (CHART, TABLE, METRIC, MAP)
- **DataSource:** External data connection (POSTGRESQL, MYSQL, REST_API, CSV)
- **AuditLog:** Immutable audit trail (CREATE, UPDATE, DELETE, LOGIN, LOGOUT)

## VERIFY Tag Registry

### Authentication (AE-AUTH-*)
- AE-AUTH-001: RegisterDto validation
- AE-AUTH-002: LoginDto validation
- AE-AUTH-003: AuthService register/login
- AE-AUTH-004: JwtStrategy validation
- AE-AUTH-005: JwtAuthGuard global + @Public()
- AE-AUTH-006: AuthController endpoints
- AE-AUTH-007: AuthModule configuration

### Dashboard (AE-DASH-*)
- AE-DASH-001: CreateDashboardDto validation
- AE-DASH-002: DashboardService CRUD
- AE-DASH-003: DashboardController endpoints

### Widget (AE-WIDG-*)
- AE-WIDG-001: CreateWidgetDto validation
- AE-WIDG-002: WidgetService CRUD
- AE-WIDG-003: WidgetController endpoints

### Data Source (AE-DS-*)
- AE-DS-001: CreateDataSourceDto validation
- AE-DS-002: DataSourceService CRUD
- AE-DS-003: DataSourceService raw query
- AE-DS-004: DataSourceController endpoints

### Audit Log (AE-AUDIT-*)
- AE-AUDIT-001: CreateAuditLogDto validation
- AE-AUDIT-002: AuditLogService CRUD
- AE-AUDIT-003: AuditLogController endpoints

### Data Model (AE-DATA-*)
- AE-DATA-001: PrismaService connection

### Security (AE-SEC-*)
- AE-SEC-001: @Public() decorator
- AE-SEC-002: @Roles() decorator
- AE-SEC-003: RolesGuard implementation
- AE-SEC-004: GlobalExceptionFilter

### Monitoring (AE-MON-*)
- AE-MON-001: Pino LoggerService
- AE-MON-002: CorrelationIdMiddleware
- AE-MON-003: RequestLoggingMiddleware
- AE-MON-004: RequestContextService
- AE-MON-005: MonitoringController
- AE-MON-006: DB readiness check
- AE-MON-007: MonitoringService metrics

### Infrastructure (AE-INFRA-*)
- AE-INFRA-001: Main bootstrap
- AE-INFRA-002: Seed script

### Performance (AE-PERF-*)
- AE-PERF-001: ResponseTimeInterceptor
- AE-PERF-002: Pagination utility

### Frontend (AE-FE-*)
- AE-FE-001: Dashboard dynamic import
- AE-FE-002: Dashboard loading state
- AE-FE-003: Dashboard error state
- AE-FE-004: Login page
- AE-FE-005: DashboardList component
- AE-FE-006: ErrorBoundaryFallback

### UI (AE-UI-*)
- AE-UI-001: cn() utility
- AE-UI-002: Server Actions
- AE-UI-003: Auth helpers
- AE-UI-004: Root layout
- AE-UI-005: Nav component

### Accessibility (AE-AX-*)
- AE-AX-001: jest-axe tests
- AE-AX-002: Keyboard navigation tests

### Architecture (AE-ARCH-*)
- AE-ARCH-001: AppModule global providers

### Testing (AE-TEST-*)
- AE-TEST-001 through AE-TEST-010: Unit, integration, and cross-layer tests

## Cross-References

- authentication.md references security.md and api-endpoints.md
- data-model.md references security.md
- api-endpoints.md references authentication.md
- frontend.md references api-endpoints.md
- infrastructure.md references data-model.md
- security.md references authentication.md
- monitoring.md references security.md
- cross-layer.md references all specifications
