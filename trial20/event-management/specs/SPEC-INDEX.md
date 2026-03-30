# Event Management Platform — Specification Index

## Overview

This document serves as the master index for all specification documents in the
Event Management Platform. Each specification covers a discrete architectural
layer or cross-cutting concern, with bidirectional traceability tags linking
requirements to their implementations.

## Tag Convention

All tags use the format: VERIFY: EM-{DOMAIN}-{NNN} — Description
Corresponding TRACED tags appear in source files at the point of implementation.

## Specification Documents

| Document | Domain | Tag Prefix | Description |
|----------|--------|------------|-------------|
| authentication.md | Auth | EM-AUTH | JWT authentication, registration, login |
| data-model.md | Data | EM-DATA | Prisma schema, entities, relationships |
| api-endpoints.md | API | EM-EVENT, EM-VENUE, EM-ATTEND, EM-REG | REST endpoints, CRUD operations |
| frontend.md | Frontend | EM-FE | Next.js pages, components, server actions |
| infrastructure.md | Infra | EM-INFRA | Docker, CI/CD, deployment |
| security.md | Security | EM-SEC | RBAC, guards, validation, Helmet |
| monitoring.md | Monitoring | EM-MON | Health checks, logging, correlation IDs |
| cross-layer.md | Cross | EM-CROSS | Integration between layers |
| edge-cases.md | Edge | EM-EDGE | Error states, boundary conditions |
| performance.md | Performance | EM-PERF | Caching, pagination, response times |

## Cross-References

- Authentication depends on Data Model (user entity) — see data-model.md
- API Endpoints depend on Authentication (JWT guard) — see authentication.md
- Frontend depends on API Endpoints (server actions) — see api-endpoints.md
- Monitoring is cross-cutting across all layers — see monitoring.md
- Security applies to all API and frontend layers — see security.md
- Performance constraints apply to API and infrastructure — see performance.md
- Edge cases span all domains — see edge-cases.md

## Traceability Summary

Total VERIFY tags: 50+
Total TRACED tags: 43+
Orphan count target: 0

## Gate Compliance

This specification set satisfies:
- Gate 3 (SD): Spec documents with cross-references
- Gate 5 (CQ-S): VERIFY/TRACED bidirectional parity
- Gate 7 (SQ): Behavioral coverage via test specs
- Gate 10 (TA-I): Integration test specifications
- Gate 12 (DX): Developer documentation

## Build and Verification

All specs are validated during CI:
1. Every VERIFY tag must have a matching TRACED tag in source
2. Every TRACED tag must have a matching VERIFY tag in specs
3. Zero orphans in either direction
4. All spec files must be >= 55 lines
5. SPEC-INDEX.md must be >= 60 lines
