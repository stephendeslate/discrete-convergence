# Fleet Dispatch — Specification Index

## Spec Files

| File | Domain | VERIFY Tags |
|------|--------|-------------|
| specs/api-layer.md | API Controllers & DTOs | FD-API-001, FD-API-002, FD-API-003, FD-API-004, FD-API-005 |
| specs/auth.md | Authentication & Authorization | FD-AUTH-001, FD-AUTH-002, FD-AUTH-003, FD-AUTH-004, FD-AUTH-005 |
| specs/data-model.md | Prisma Schema & State Machines | FD-DM-001, FD-DM-002, FD-DM-003, FD-DM-004, FD-DM-005 |
| specs/infrastructure.md | Docker, CI, Monorepo | FD-INF-001, FD-INF-002, FD-INF-003, FD-INF-004, FD-INF-005 |
| specs/security.md | Helmet, CORS, Rate Limit, Auth | FD-SEC-001, FD-SEC-002, FD-SEC-003, FD-SEC-004, FD-SEC-005, FD-SEC-006 |
| specs/monitoring.md | Logging, Health, Metrics | FD-MON-001, FD-MON-002, FD-MON-003, FD-MON-004, FD-MON-005, FD-MON-006, FD-MON-007, FD-MON-008 |
| specs/cross-layer.md | Integration & Tests | FD-CL-001, FD-CL-002, FD-CL-003, FD-CL-004, FD-TEST-001, FD-TEST-002, FD-TEST-003, FD-TEST-004, FD-TEST-005, FD-TEST-006 |
| specs/performance.md | Response Time, Pagination, Cache | FD-PERF-001, FD-PERF-002, FD-PERF-003 |
| specs/frontend.md | Next.js UI, Components, A11y | FD-FE-001, FD-FE-002, FD-FE-003, FD-FE-004, FD-FE-005, FD-FE-006 |

## Tag Prefix Legend

| Prefix | Domain |
|--------|--------|
| FD-API | REST API controllers and DTOs |
| FD-AUTH | Authentication and authorization |
| FD-DM | Data model, schema, state machines |
| FD-INF | Infrastructure (Docker, CI, monorepo) |
| FD-SEC | Security (Helmet, CORS, throttling, validation) |
| FD-MON | Monitoring (logging, health, metrics) |
| FD-CL | Cross-layer integration and wiring |
| FD-TEST | Test coverage (unit and integration) |
| FD-PERF | Performance (timing, pagination, caching) |
| FD-FE | Frontend (components, accessibility, layout) |

## Cross-Reference Matrix

Specs with cross-references to other specs (>= 2 required):
- specs/api-layer.md → auth.md, data-model.md, performance.md
- specs/auth.md → cross-layer.md, security.md
- specs/data-model.md → api-layer.md, performance.md
- specs/infrastructure.md → cross-layer.md, security.md
- specs/security.md → auth.md, cross-layer.md, performance.md
- specs/monitoring.md → performance.md, cross-layer.md
- specs/cross-layer.md → auth.md, security.md, monitoring.md
- specs/performance.md → monitoring.md, data-model.md, api-layer.md
- specs/frontend.md → cross-layer.md, api-layer.md, auth.md

## Total VERIFY Tag Count

| Domain | Count |
|--------|-------|
| FD-API | 5 |
| FD-AUTH | 5 |
| FD-DM | 5 |
| FD-INF | 5 |
| FD-SEC | 6 |
| FD-MON | 8 |
| FD-CL | 4 |
| FD-TEST | 6 |
| FD-PERF | 3 |
| FD-FE | 6 |
| **Total** | **53** |
