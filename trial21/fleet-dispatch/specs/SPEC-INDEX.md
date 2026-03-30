# Specification Index — Fleet Dispatch

## Spec Files
| File | Description | VERIFY Count |
|------|-------------|-------------|
| [authentication.md](authentication.md) | Auth flow, JWT, registration | 6 |
| [data-model.md](data-model.md) | Prisma schema, entities, relations | 7 |
| [api-endpoints.md](api-endpoints.md) | REST API endpoints, pagination | 16 |
| [frontend.md](frontend.md) | Next.js pages, components, a11y | 11 |
| [security.md](security.md) | Auth, RBAC, throttle, validation | 10 |
| [infrastructure.md](infrastructure.md) | Docker, CI/CD, health, startup | 8 |
| [monitoring.md](monitoring.md) | Logging, tracing, metrics | 12 |

## VERIFY Tag Registry

### Authentication (FD-AUTH)
- FD-AUTH-001: AuthService login/register/refresh — authentication.md, auth.service.ts
- FD-AUTH-002: Registration role restriction — authentication.md, shared/index.ts
- FD-AUTH-003: Rate-limited auth endpoints — authentication.md, auth.controller.ts

### Security (FD-SEC)
- FD-SEC-001: bcryptjs 12 salt rounds — security.md, shared/index.ts
- FD-SEC-002: Log context sanitization — security.md, shared/index.ts
- FD-SEC-003: JWT strategy configuration — security.md, jwt.strategy.ts
- FD-SEC-004: Global JwtAuthGuard — security.md, jwt-auth.guard.ts
- FD-SEC-005: RolesGuard RBAC — security.md, roles.guard.ts

### API (FD-API)
- FD-API-001: MAX_PAGE_SIZE 100 — api-endpoints.md, shared/index.ts
- FD-API-002: DEFAULT_PAGE_SIZE 20 — shared/index.ts

### Company (FD-COMP)
- FD-COMP-001: Company service — data-model.md, company.service.ts
- FD-COMP-002: Company controller — api-endpoints.md, company.controller.ts

### Work Orders (FD-WO)
- FD-WO-001: State machine transitions — data-model.md, work-order.service.ts
- FD-WO-002: Work order CRUD — work-order.service.ts
- FD-WO-003: Work order controller — api-endpoints.md, work-order.controller.ts

### Technicians (FD-TECH)
- FD-TECH-001: Technician service — technician.service.ts
- FD-TECH-002: Technician controller — api-endpoints.md, technician.controller.ts

### Customers (FD-CUST)
- FD-CUST-001: Customer service — customer.service.ts
- FD-CUST-002: Customer controller — api-endpoints.md, customer.controller.ts

### Routes (FD-ROUTE)
- FD-ROUTE-001: Route optimization service — route.service.ts
- FD-ROUTE-002: Route controller — api-endpoints.md, route.controller.ts

### Invoices (FD-INV)
- FD-INV-001: Invoice lifecycle — data-model.md, invoice.service.ts
- FD-INV-002: Invoice immutability — data-model.md, invoice.service.ts
- FD-INV-003: Invoice controller — api-endpoints.md, invoice.controller.ts

### Photos (FD-PHOTO)
- FD-PHOTO-001: Photo service — photo.service.ts
- FD-PHOTO-002: Photo controller — api-endpoints.md, photo.controller.ts

### Notifications (FD-NOTIF)
- FD-NOTIF-001: Notification service — notification.service.ts
- FD-NOTIF-002: Notification controller — api-endpoints.md, notification.controller.ts

### Tracking (FD-TRACK)
- FD-TRACK-001: Tracking token validation — data-model.md, tracking.service.ts
- FD-TRACK-002: Public tracking endpoint — api-endpoints.md, tracking.controller.ts

### GPS (FD-GPS)
- FD-GPS-001: GPS batch insert — data-model.md, technician.service.ts

### Audit (FD-AUDIT)
- FD-AUDIT-001: Audit log service — audit.service.ts
- FD-AUDIT-002: Audit controller — api-endpoints.md, audit.controller.ts

### Dashboard/Data Source (FD-DASH, FD-DS)
- FD-DASH-001: Placeholder dashboard controller — api-endpoints.md, dashboard.controller.ts
- FD-DS-001: Placeholder data-source controller — api-endpoints.md, data-source.controller.ts

### Infrastructure (FD-INFRA)
- FD-INFRA-001: Environment validation — infrastructure.md, shared/index.ts
- FD-INFRA-002: Health readiness check — infrastructure.md, health.service.ts
- FD-INFRA-003: Health controller — infrastructure.md, health.controller.ts

### Monitoring (FD-MON)
- FD-MON-001: Correlation ID creation — monitoring.md, shared/index.ts
- FD-MON-002: Structured log formatting — monitoring.md, shared/index.ts
- FD-MON-003: Response time interceptor — monitoring.md, response-time.interceptor.ts
- FD-MON-004: Correlation ID middleware — monitoring.md, correlation-id.middleware.ts
- FD-MON-005: Metrics service — monitoring.md, metrics.service.ts
- FD-MON-006: Metrics controller — monitoring.md, metrics.controller.ts
- FD-MON-007: Monitoring controller — monitoring.md, monitoring.controller.ts

### Frontend (FD-FE)
- FD-FE-001: Login cookie storage — frontend.md, actions.ts
- FD-FE-002: Register action — frontend.md, actions.ts
- FD-FE-003: API fetch helper — frontend.md, actions.ts
- FD-FE-004: Work order fetching — frontend.md, actions.ts
- FD-FE-005: Technician fetching — frontend.md, actions.ts
- FD-FE-006: Public tracking fetch — frontend.md, actions.ts
- FD-FE-007: Tracking portal page — frontend.md, track/[token]/page.tsx
- FD-FE-008: Login form component — frontend.md, login-form.tsx
- FD-FE-009: Register form component — frontend.md, register-form.tsx
- FD-FE-010: Dispatch map component — frontend.md, dispatch-map.tsx
- FD-FE-011: Leaflet map inner — frontend.md, leaflet-map-inner.tsx

### Edge Cases (FD-EDGE)
- FD-EDGE-001: Invalid status transition → 400 — security.md
- FD-EDGE-002: Expired tracking token → 404 — security.md
- FD-EDGE-003: Duplicate invoice → 400 — security.md
- FD-EDGE-004: Void after payment → 400 — security.md
- FD-EDGE-005: Cross-tenant access → 404 — security.md
- FD-EDGE-006: GPS batch insert failures — monitoring.md
- FD-EDGE-007: Invoice state violations — monitoring.md
- FD-EDGE-008: Expired tracking access — monitoring.md
- FD-EDGE-009: Cross-tenant access attempts — monitoring.md
- FD-EDGE-010: DB connectivity loss — monitoring.md

## Cross-References
- All spec files cross-reference at least 2 other specs
- VERIFY tags in .ts/.tsx files only (TRACED comments)
- 55+ VERIFY entries total
