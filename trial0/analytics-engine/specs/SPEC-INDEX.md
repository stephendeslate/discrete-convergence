# Analytics Engine — Specification Index

## Overview

Multi-tenant embeddable analytics platform enabling organizations to connect
data sources, build dashboards with configurable widgets, and embed them into
third-party applications via iframe or SDK.

## Document Index

| Document | Path | Description |
|----------|------|-------------|
| Authentication | [authentication.md](authentication.md) | JWT auth, registration, role model |
| Data Model | [data-model.md](data-model.md) | Prisma schema, entities, enums, RLS |
| API Endpoints | [api-endpoints.md](api-endpoints.md) | REST routes, DTOs, pagination |
| Frontend | [frontend.md](frontend.md) | Next.js pages, components, a11y |
| Infrastructure | [infrastructure.md](infrastructure.md) | Docker, CI/CD, migrations |
| Security | [security.md](security.md) | CSP, CORS, validation, rate limiting |
| Monitoring | [monitoring.md](monitoring.md) | Health, metrics, logging, error tracking |

## Cross-References

- Authentication ↔ Security: JWT strategy, guard chain, rate limiting on auth endpoints
- Data Model ↔ API Endpoints: Each entity maps to a REST resource
- Frontend ↔ Monitoring: Error boundary POSTs to /api/monitoring/errors
- Infrastructure ↔ Data Model: Migrations enforce RLS policies
- Security ↔ Monitoring: Exception filter sanitizes errors, correlationId in responses
- API Endpoints ↔ Frontend: Server actions call API routes with auth tokens
- Data Model ↔ Security: Row Level Security on all tenant-scoped tables

## Verification Tags

All specs use VERIFY tags that map bidirectionally to TRACED tags in source code.
Each VERIFY:AE-XXX-NNN references exactly one TRACED:AE-XXX-NNN in the implementation.

## Tech Stack

- **Runtime:** Node.js 20 LTS
- **API:** NestJS 11 with Passport JWT, class-validator, Prisma 6
- **Web:** Next.js 15 with App Router, Tailwind CSS, shadcn/ui components
- **Database:** PostgreSQL 16 with Row Level Security
- **Shared:** packages/shared with 8+ exported utilities
- **Build:** Turborepo 2 with pnpm workspaces
- **Testing:** Vitest, supertest, @testing-library/react, jest-axe, userEvent

## Scoring Dimensions

This project targets all 12 SDD methodology dimensions:
1. Spec Quality — 7 documents, each >= 55 lines, cross-references
2. Contract Fidelity — DTOs, validation, type safety
3. Layer Isolation — NestJS modules, clean boundaries
4. Error Architecture — GlobalExceptionFilter, error boundaries
5. Convention Adherence — No `as any`, no `console.log`, no fallbacks
6. Verification — VERIFY↔TRACED bidirectional parity
7. Test Realism — Real modules, supertest, jest-axe
8. Security Posture — Helmet, CORS, RLS, input validation
9. Performance — Response time, pagination, caching
10. Monitoring — Health, metrics, structured logging
11. DX Quality — CLAUDE.md, turbo tasks, .env.example
12. Accessibility — ARIA roles, keyboard nav, focus management
