# Event Management — Specification Index

> **Project:** Event Management
> **Trial:** 10 (discrete-convergence)
> **Spec Prefix:** EM-
> **Last Updated:** 2026-03-24

---

## Specification Documents

| # | Document | Description | VERIFY Tags |
|---|----------|-------------|-------------|
| 1 | [authentication.md](authentication.md) | JWT auth, registration, role-based access | EM-AUTH-001 – EM-AUTH-006 |
| 2 | [data-model.md](data-model.md) | Prisma schema, entities, indexes, RLS | EM-DATA-001 – EM-DATA-007 |
| 3 | [api-endpoints.md](api-endpoints.md) | REST API routes, controllers, DTOs | EM-API-001 – EM-API-007 |
| 4 | [frontend.md](frontend.md) | Next.js app, shadcn/ui, accessibility | EM-FE-001 – EM-FE-005 |
| 5 | [infrastructure.md](infrastructure.md) | Docker, CI/CD, migrations, seed | EM-INFRA-001 – EM-INFRA-005 |
| 6 | [security.md](security.md) | Helmet, CORS, throttling, validation, RBAC | EM-SEC-001 – EM-SEC-006 |
| 7 | [monitoring.md](monitoring.md) | Logging, correlation IDs, health, metrics | EM-MON-001 – EM-MON-005 |
| 8 | [cross-layer.md](cross-layer.md) | Global providers, integration, shared package | EM-CROSS-001 – EM-CROSS-004 |
| 9 | [domain-services.md](domain-services.md) | Event, Venue, Ticket, Registration services | EM-EVENT-001, EM-VENUE-001, EM-TICKET-001, EM-REG-001 |

---

## Tag Convention

- **Prefix:** `EM-` (Event Management)
- **Format:** `VERIFY:EM-{CATEGORY}-{NNN}` in specs, `TRACED:EM-{CATEGORY}-{NNN}` in `.ts`/`.tsx` source files
- **TRACED restriction:** TRACED tags appear ONLY in `.ts` and `.tsx` files — never in `.prisma`, `.sql`, `.css`, `.yaml`, `.json`, or CI config files
- **Bidirectional parity:** Every VERIFY tag has exactly one matching TRACED tag, and vice versa

## Categories

| Category | Prefix | Scope |
|----------|--------|-------|
| AUTH | EM-AUTH | Authentication and authorization |
| DATA | EM-DATA | Data model, schema, indexes, RLS |
| API | EM-API | API endpoints and controllers |
| FE | EM-FE | Frontend components and pages |
| INFRA | EM-INFRA | Infrastructure and deployment |
| SEC | EM-SEC | Security hardening |
| MON | EM-MON | Monitoring and observability |
| CROSS | EM-CROSS | Cross-layer integration |
| EVENT | EM-EVENT | Event domain service |
| VENUE | EM-VENUE | Venue domain service |
| TICKET | EM-TICKET | Ticket domain service |
| REG | EM-REG | Registration domain service |

---

## Cross-References

All specification documents reference related specs using markdown link syntax.
See [authentication.md](authentication.md) for auth flow details.
See [data-model.md](data-model.md) for entity relationships.
See [api-endpoints.md](api-endpoints.md) for REST API contracts.
See [monitoring.md](monitoring.md) for observability patterns.
See [security.md](security.md) for hardening and threat mitigations.
See [frontend.md](frontend.md) for UI component and accessibility requirements.
See [domain-services.md](domain-services.md) for business logic and validation rules.
