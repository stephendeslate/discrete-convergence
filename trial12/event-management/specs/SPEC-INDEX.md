# Specification Index — Event Management

## Specifications

| File | Domain | VERIFY Tags |
|------|--------|-------------|
| [authentication.md](authentication.md) | Auth flow, JWT, registration, login | EM-AUTH-001..009 |
| [data-model.md](data-model.md) | Prisma schema, RLS, enums, indexes | EM-DATA-001..011 |
| [api-endpoints.md](api-endpoints.md) | REST endpoints, DTOs, controllers | EM-EVENT-001..004, EM-VENUE-001..004, EM-SCHED-001..004, EM-TICKET-001..004, EM-ATTEND-001..003 |
| [frontend.md](frontend.md) | UI components, routes, loading/error states | EM-UI-001..006 |
| [security.md](security.md) | Guards, decorators, rate limiting, validation | EM-SEC-001..005, EM-EVENT-005..006, EM-VENUE-005, EM-TICKET-005 |
| [monitoring.md](monitoring.md) | Logging, correlation, health checks, performance | EM-MON-001..011, EM-PERF-001..004 |
| [infrastructure.md](infrastructure.md) | Docker, CI/CD, env validation, shared package | EM-INFRA-001..004, EM-SHARED-001..005 |
| [cross-layer.md](cross-layer.md) | Integration, frontend-API bridge, accessibility | EM-CROSS-001..002, EM-FI-001..004, EM-AX-001..002 |

## Tag Summary

| Prefix | Count | Spec File |
|--------|-------|-----------|
| EM-AUTH | 9 | authentication.md |
| EM-DATA | 11 | data-model.md |
| EM-EVENT | 6 | api-endpoints.md, security.md |
| EM-VENUE | 5 | api-endpoints.md, security.md |
| EM-SCHED | 4 | api-endpoints.md |
| EM-TICKET | 5 | api-endpoints.md, security.md |
| EM-ATTEND | 3 | api-endpoints.md |
| EM-UI | 6 | frontend.md |
| EM-SEC | 5 | security.md |
| EM-MON | 11 | monitoring.md |
| EM-PERF | 4 | monitoring.md |
| EM-INFRA | 4 | infrastructure.md |
| EM-SHARED | 5 | infrastructure.md |
| EM-CROSS | 2 | cross-layer.md |
| EM-FI | 4 | cross-layer.md |
| EM-AX | 2 | cross-layer.md |
| **Total** | **86** | |

## Verification

All TRACED tags in source code must have a matching VERIFY tag in specs.
All VERIFY tags in specs must have a matching TRACED tag in source code.
Zero orphans required for Gate 4 passage.
