# Specification Index

## Overview

This index catalogs all specification documents for the Analytics Engine project.
Each specification covers a distinct domain and contains VERIFY tags that trace
to TRACED tags in the implementation code.

## Specifications

### authentication.md
- JWT-based authentication with access and refresh tokens
- Password hashing with bcryptjs and configurable salt rounds
- Registration restricted to VIEWER role
- Guard chain: ThrottlerGuard -> JwtAuthGuard -> RolesGuard
- VERIFY tags: AE-AUTH-001 through AE-AUTH-007 (7 tags)

### data-model.md
- Four primary entities: User, Dashboard, DataSource, Widget
- Prisma ORM with PostgreSQL and Row-Level Security
- Multi-tenant isolation via tenantId on all models
- Explicit table mapping with @@map and @@index
- VERIFY tags: AE-DATA-001, AE-DATA-002, AE-DATA-009 (3 tags)

### api-endpoints.md
- RESTful CRUD endpoints for all domain entities
- Pagination with clampPagination from shared package
- Input validation via ValidationPipe
- Role-based access for delete operations
- VERIFY tags: AE-DASH-001, AE-DS-001, AE-WID-001 (3 tags)

### frontend.md
- Next.js 15 with App Router and React 19
- Server actions for API communication
- shadcn/ui-style components with class-variance-authority
- Accessibility: jest-axe audits, keyboard navigation, ARIA attributes
- VERIFY tags: AE-FE-001 through AE-FE-016, AE-A11Y-001, AE-A11Y-002 (18 tags)

### infrastructure.md
- Docker multi-stage build with HEALTHCHECK
- Docker Compose with PostgreSQL health checks
- pnpm workspaces with Turborepo task orchestration
- GitHub Actions CI/CD pipeline
- VERIFY tags: AE-INFRA-001, AE-INFRA-002 (2 tags)

### security.md
- Helmet middleware with Content-Security-Policy
- Rate limiting with ThrottlerGuard
- Input validation with whitelist and forbidNonWhitelisted
- Multi-tenant isolation at application and database levels
- VERIFY tags: AE-SEC-001 through AE-SEC-008 (8 tags)

### monitoring.md
- Health and readiness endpoints
- Metrics collection (request count, error count, response time)
- Correlation ID tracing via middleware
- Structured logging with Pino and log sanitization
- VERIFY tags: AE-MON-001 through AE-MON-009 (9 tags)

### cross-layer.md
- Layer architecture: frontend, API, shared, infrastructure
- Integration contracts between layers
- Middleware chain processing order
- Error propagation across layers
- VERIFY tags: AE-CROSS-001 (1 tag)

### performance.md
- Response time targets and tracking
- Database optimization with indexes
- Rate limiting for resource protection
- Frontend performance with server components
- VERIFY tags: AE-PERF-001 through AE-PERF-006 (6 tags)

### edge-cases.md
- Authentication edge cases: empty input, expired tokens, malformed tokens
- Pagination boundary conditions: clamping, oversized limits
- Tenant isolation: cross-tenant returns 404 not 403
- Input validation: extra fields, XSS, SQL injection
- VERIFY tags: AE-EDGE-001 through AE-EDGE-012 (12 tags)

## Tag Summary

| Prefix    | Count | Specification       |
|-----------|-------|---------------------|
| AE-AUTH   | 7     | authentication.md   |
| AE-DATA   | 3     | data-model.md       |
| AE-DASH   | 1     | api-endpoints.md    |
| AE-DS     | 1     | api-endpoints.md    |
| AE-WID    | 1     | api-endpoints.md    |
| AE-FE     | 16    | frontend.md         |
| AE-A11Y   | 2     | frontend.md         |
| AE-INFRA  | 2     | infrastructure.md   |
| AE-SEC    | 8     | security.md         |
| AE-MON    | 9     | monitoring.md       |
| AE-CROSS  | 1     | cross-layer.md      |
| AE-PERF   | 6     | performance.md      |
| AE-EDGE   | 12    | edge-cases.md       |
| **Total** | **69**| All specifications  |

## Cross-References

- authentication.md <-> security.md (token security, password hashing)
- authentication.md <-> api-endpoints.md (auth endpoint contracts)
- data-model.md <-> security.md (RLS policies, tenant isolation)
- data-model.md <-> api-endpoints.md (entity structures)
- frontend.md <-> api-endpoints.md (server action contracts)
- frontend.md <-> security.md (cookie token storage)
- infrastructure.md <-> monitoring.md (HEALTHCHECK, probes)
- infrastructure.md <-> security.md (env validation)
- monitoring.md <-> security.md (log sanitization)
- cross-layer.md <-> all other specs (integration)
- performance.md <-> monitoring.md (response time tracking)
- edge-cases.md <-> authentication.md, security.md, api-endpoints.md
