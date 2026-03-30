# Fleet Dispatch — Specification Index

## Project

- **Name:** Fleet Dispatch
- **Domain:** Multi-tenant field service dispatch platform
- **Trial:** 3 (Discrete Convergence)
- **VERIFY/TRACED prefix:** FD-

## Specification Documents

| Document | Description | VERIFY Tags |
|----------|-------------|-------------|
| [authentication.md](authentication.md) | JWT auth, registration, roles | FD-AUTH-001..004 |
| [data-model.md](data-model.md) | Prisma schema, entities, RLS | FD-TECH-001..002, FD-CUST-001..002, FD-WO-001..003, FD-ROUTE-001..002, FD-INV-001..003, FD-DA-001 |
| [api-endpoints.md](api-endpoints.md) | REST endpoints, pagination | FD-NOTIF-001, FD-AUDIT-001..002 |
| [frontend.md](frontend.md) | Next.js UI, components, a11y | FD-UI-001..004 |
| [infrastructure.md](infrastructure.md) | Docker, CI/CD, seed | FD-INF-001..003 |
| [security.md](security.md) | Auth guards, CSP, rate limiting | FD-SEC-001..005 |
| [monitoring.md](monitoring.md) | Logging, health, metrics, errors | FD-MON-001..010 |
| [cross-layer.md](cross-layer.md) | Integration, shared, perf | FD-ARCH-001, FD-PERF-001..002, FD-CONST-001..002 |

## VERIFY Tag Registry

| Tag | Spec | Description |
|-----|------|-------------|
| FD-AUTH-001 | authentication.md | AuthService registration with bcrypt |
| FD-AUTH-002 | authentication.md | AuthController public endpoints |
| FD-AUTH-003 | authentication.md | JwtStrategy payload validation |
| FD-AUTH-004 | authentication.md | RegisterDto ALLOWED_REGISTRATION_ROLES |
| FD-SEC-001 | security.md | @Public() decorator |
| FD-SEC-002 | security.md | JwtAuthGuard APP_GUARD |
| FD-SEC-003 | security.md | ALLOWED_REGISTRATION_ROLES excludes ADMIN |
| FD-SEC-004 | security.md | ThrottlerModule dual configs |
| FD-SEC-005 | security.md | main.ts Helmet/CORS/ValidationPipe |
| FD-WO-001 | data-model.md | WorkOrderService CRUD |
| FD-WO-002 | data-model.md | WorkOrderService state machine |
| FD-WO-003 | data-model.md | WorkOrderController endpoints |
| FD-TECH-001 | data-model.md | TechnicianService CRUD |
| FD-TECH-002 | data-model.md | TechnicianController endpoints |
| FD-CUST-001 | data-model.md | CustomerService CRUD |
| FD-CUST-002 | data-model.md | CustomerController endpoints |
| FD-ROUTE-001 | data-model.md | RouteService CRUD |
| FD-ROUTE-002 | data-model.md | RouteController endpoints |
| FD-INV-001 | data-model.md | InvoiceService creation |
| FD-INV-002 | data-model.md | InvoiceService status transitions |
| FD-INV-003 | data-model.md | InvoiceController endpoints |
| FD-NOTIF-001 | api-endpoints.md | NotificationService operations |
| FD-AUDIT-001 | api-endpoints.md | AuditLogService operations |
| FD-AUDIT-002 | api-endpoints.md | AuditLogController endpoint |
| FD-DA-001 | data-model.md | $executeRaw for RLS purge |
| FD-UI-001 | frontend.md | cn() utility |
| FD-UI-002 | frontend.md | Server Actions response check |
| FD-UI-003 | frontend.md | Nav component with APP_VERSION |
| FD-UI-004 | frontend.md | Dark mode media query |
| FD-INF-001 | infrastructure.md | validateEnvVars startup |
| FD-INF-002 | infrastructure.md | Seed error handling |
| FD-INF-003 | infrastructure.md | Dockerfile configuration |
| FD-MON-001 | monitoring.md | Health endpoint |
| FD-MON-002 | monitoring.md | Readiness $queryRaw |
| FD-MON-003 | monitoring.md | createCorrelationId |
| FD-MON-004 | monitoring.md | formatLogEntry |
| FD-MON-005 | monitoring.md | sanitizeLogContext |
| FD-MON-006 | monitoring.md | RequestContextService |
| FD-MON-007 | monitoring.md | CorrelationIdMiddleware |
| FD-MON-008 | monitoring.md | RequestLoggingMiddleware |
| FD-MON-009 | monitoring.md | GlobalExceptionFilter |
| FD-MON-010 | monitoring.md | MonitoringController |
| FD-ARCH-001 | cross-layer.md | AppModule provider chain |
| FD-PERF-001 | cross-layer.md | clampPagination |
| FD-PERF-002 | cross-layer.md | ResponseTimeInterceptor |
| FD-CONST-001 | cross-layer.md | APP_VERSION constant |
| FD-CONST-002 | cross-layer.md | BCRYPT_SALT_ROUNDS constant |

## Cross-References

- authentication.md references security.md
- data-model.md references api-endpoints.md
- api-endpoints.md references authentication.md
- frontend.md references (standalone)
- infrastructure.md references (standalone)
- security.md references (standalone)
- monitoring.md references (standalone)
- cross-layer.md references (standalone)

## Conventions

- TRACED tags only in .ts/.tsx files
- Every VERIFY must have a matching TRACED
- Every TRACED must have a matching VERIFY
- VERIFY tags use HTML comment syntax in markdown
- TRACED tags use // comment syntax in TypeScript
