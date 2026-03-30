# Fleet Dispatch — Specification Index

> **Project:** Fleet Dispatch
> **Trial:** 10 (discrete-convergence)
> **Spec Prefix:** FD-
> **Last Updated:** 2026-03-24

---

## Specification Documents

| # | Document | Description | VERIFY Tags |
|---|----------|-------------|-------------|
| 1 | [authentication.md](authentication.md) | JWT auth, registration, role-based access | FD-AUTH-001 – FD-AUTH-006 |
| 2 | [data-model.md](data-model.md) | Prisma schema, entities, indexes, RLS | FD-DATA-001 – FD-DATA-008 |
| 3 | [api-endpoints.md](api-endpoints.md) | REST API routes, controllers, DTOs | FD-API-001 – FD-API-006 |
| 4 | [frontend.md](frontend.md) | Next.js app, shadcn/ui, accessibility | FD-FE-001 – FD-FE-005 |
| 5 | [infrastructure.md](infrastructure.md) | Docker, CI/CD, migrations, seed | FD-INFRA-001 – FD-INFRA-004 |
| 6 | [security.md](security.md) | Helmet, CORS, throttling, validation, RBAC | FD-SEC-001 – FD-SEC-006 |
| 7 | [monitoring.md](monitoring.md) | Logging, correlation IDs, health, metrics | FD-MON-001 – FD-MON-005 |
| 8 | [cross-layer.md](cross-layer.md) | Global providers, integration, shared package | FD-CROSS-001 – FD-CROSS-004 |

---

## Tag Convention

- **Prefix:** `FD-` (Fleet Dispatch)
- **Format:** `VERIFY:FD-{CATEGORY}-{NNN}` in specs, `TRACED:FD-{CATEGORY}-{NNN}` in `.ts`/`.tsx` source files
- **TRACED restriction:** TRACED tags appear ONLY in `.ts` and `.tsx` files — never in `.prisma`, `.sql`, `.css`, `.yaml`, `.json`, or CI config files
- **Bidirectional parity:** Every VERIFY tag has exactly one matching TRACED tag, and vice versa

## Categories

| Category | Prefix | Scope |
|----------|--------|-------|
| AUTH | FD-AUTH | Authentication and authorization |
| DATA | FD-DATA | Data model, schema, indexes, RLS |
| API | FD-API | API endpoints and controllers |
| FE | FD-FE | Frontend components and pages |
| INFRA | FD-INFRA | Infrastructure and deployment |
| SEC | FD-SEC | Security hardening |
| MON | FD-MON | Monitoring and observability |
| CROSS | FD-CROSS | Cross-layer integration |

---

## Tag Summary

| Tag | Spec | Source Location |
|-----|------|----------------|
| FD-AUTH-001 | authentication.md | auth.service.ts |
| FD-AUTH-002 | authentication.md | register.dto.ts |
| FD-AUTH-003 | authentication.md | auth.controller.ts |
| FD-AUTH-004 | authentication.md | app.module.ts |
| FD-AUTH-005 | authentication.md | public.decorator.ts |
| FD-AUTH-006 | authentication.md | auth-utils.ts |
| FD-DATA-001 | data-model.md | (Prisma schema — tag in service files) |
| FD-DATA-002 | data-model.md | (Prisma enums — tag in service files) |
| FD-DATA-003 | data-model.md | (Prisma indexes — tag in service files) |
| FD-DATA-004 | data-model.md | (Prisma Decimal — tag in service files) |
| FD-DATA-005 | data-model.md | (RLS migration — tag in service files) |
| FD-DATA-006 | data-model.md | vehicle.service.ts |
| FD-DATA-007 | data-model.md | (Entity relationships — tag in service files) |
| FD-DATA-008 | data-model.md | seed.ts |
| FD-API-001 | api-endpoints.md | vehicle.controller.ts |
| FD-API-002 | api-endpoints.md | driver.controller.ts |
| FD-API-003 | api-endpoints.md | route.controller.ts |
| FD-API-004 | api-endpoints.md | register.dto.ts |
| FD-API-005 | api-endpoints.md | dispatch.controller.ts |
| FD-API-006 | api-endpoints.md | vehicle.controller.ts |
| FD-FE-001 | frontend.md | layout.tsx |
| FD-FE-002 | frontend.md | (loading.tsx files) |
| FD-FE-003 | frontend.md | (error.tsx files) |
| FD-FE-004 | frontend.md | layout.tsx |
| FD-FE-005 | frontend.md | actions.ts |
| FD-INFRA-001 | infrastructure.md | (Dockerfile — tag in main.ts) |
| FD-INFRA-002 | infrastructure.md | (Docker Compose — tag in main.ts) |
| FD-INFRA-003 | infrastructure.md | (CI — tag in main.ts) |
| FD-INFRA-004 | infrastructure.md | main.ts |
| FD-SEC-001 | security.md | main.ts |
| FD-SEC-002 | security.md | app.module.ts |
| FD-SEC-003 | security.md | main.ts |
| FD-SEC-004 | security.md | main.ts |
| FD-SEC-005 | security.md | roles.decorator.ts |
| FD-SEC-006 | security.md | roles.guard.ts |
| FD-MON-001 | monitoring.md | request-logging.middleware.ts |
| FD-MON-002 | monitoring.md | correlation-id.middleware.ts |
| FD-MON-003 | monitoring.md | monitoring.controller.ts |
| FD-MON-004 | monitoring.md | global-exception.filter.ts |
| FD-MON-005 | monitoring.md | response-time.interceptor.ts |
| FD-CROSS-001 | cross-layer.md | app.module.ts |
| FD-CROSS-002 | cross-layer.md | index.ts (shared) |
| FD-CROSS-003 | cross-layer.md | cross-layer.integration.spec.ts |
| FD-CROSS-004 | cross-layer.md | (consumed by both apps) |

---

## Cross-References

All specification documents reference related specs using markdown link syntax.
See [authentication.md](authentication.md) for auth flow details.
See [data-model.md](data-model.md) for entity relationships.
See [api-endpoints.md](api-endpoints.md) for REST API contracts.
See [monitoring.md](monitoring.md) for observability patterns.
See [security.md](security.md) for hardening and threat mitigations.
See [frontend.md](frontend.md) for UI component and accessibility requirements.
See [cross-layer.md](cross-layer.md) for integration verification.
See [infrastructure.md](infrastructure.md) for deployment and CI.
