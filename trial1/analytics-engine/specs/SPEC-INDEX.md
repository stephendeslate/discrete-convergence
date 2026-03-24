# Analytics Engine — Specification Index

> **Project:** Analytics Engine
> **Trial:** 1 (discrete-convergence Phase 0)
> **Spec Prefix:** AE-
> **Last Updated:** 2026-03-23

---

## Specification Documents

| # | Document | Description | VERIFY Tags |
|---|----------|-------------|-------------|
| 1 | [authentication.md](authentication.md) | JWT auth, registration, role-based access | AE-AUTH-001 – AE-AUTH-005 |
| 2 | [data-model.md](data-model.md) | Prisma schema, entities, indexes, RLS | AE-DATA-001 – AE-DATA-008 |
| 3 | [api-endpoints.md](api-endpoints.md) | REST API routes, controllers, DTOs | AE-API-001 – AE-API-006 |
| 4 | [frontend.md](frontend.md) | Next.js app, shadcn/ui, accessibility | AE-FE-001 – AE-FE-005 |
| 5 | [infrastructure.md](infrastructure.md) | Docker, CI/CD, migrations, seed | AE-INFRA-001 – AE-INFRA-004 |
| 6 | [security.md](security.md) | Helmet, CORS, throttling, validation | AE-SEC-001 – AE-SEC-004 |
| 7 | [monitoring.md](monitoring.md) | Logging, correlation IDs, health, metrics | AE-MON-001 – AE-MON-005 |
| 8 | [cross-layer.md](cross-layer.md) | Global providers, integration, shared package | AE-CROSS-001 – AE-CROSS-004 |

---

## Tag Convention

- **Prefix:** `AE-` (Analytics Engine)
- **Format:** `VERIFY:AE-{CATEGORY}-{NNN}` in specs, `TRACED:AE-{CATEGORY}-{NNN}` in `.ts`/`.tsx` source files
- **TRACED restriction:** TRACED tags appear ONLY in `.ts` and `.tsx` files — never in `.prisma`, `.sql`, `.css`, `.yaml`, `.json`, or CI config files
- **Bidirectional parity:** Every VERIFY tag has exactly one matching TRACED tag, and vice versa

## Categories

| Category | Prefix | Scope |
|----------|--------|-------|
| AUTH | AE-AUTH | Authentication and authorization |
| DATA | AE-DATA | Data model, schema, indexes, RLS |
| API | AE-API | API endpoints and controllers |
| FE | AE-FE | Frontend components and pages |
| INFRA | AE-INFRA | Infrastructure and deployment |
| SEC | AE-SEC | Security hardening |
| MON | AE-MON | Monitoring and observability |
| CROSS | AE-CROSS | Cross-layer integration |

---

## Cross-References

All specification documents reference related specs using markdown link syntax.
See [authentication.md](authentication.md) for auth flow details.
See [data-model.md](data-model.md) for entity relationships.
See [api-endpoints.md](api-endpoints.md) for REST API contracts.
See [monitoring.md](monitoring.md) for observability patterns.
