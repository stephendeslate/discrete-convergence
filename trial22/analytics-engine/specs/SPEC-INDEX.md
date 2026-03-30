# Analytics Engine Specification Index

## Overview

This document serves as the central index for all technical specifications
of the Analytics Engine platform. The Analytics Engine is a multi-tenant
embeddable analytics platform built with NestJS 11 (backend), Next.js 15
(frontend), PostgreSQL via Prisma 6 (data layer), and a shared utility
package.

## Specification Documents

| Document | Description | Status |
|----------|-------------|--------|
| [authentication.md](authentication.md) | JWT auth, refresh tokens, registration | Complete |
| [data-model.md](data-model.md) | Prisma schema, 15 entities, RLS | Complete |
| [api-endpoints.md](api-endpoints.md) | REST API routes, DTOs, pagination | Complete |
| [frontend.md](frontend.md) | Next.js 15 app router, components, a11y | Complete |
| [infrastructure.md](infrastructure.md) | Docker, CI/CD, env configuration | Complete |
| [security.md](security.md) | Guards, RBAC, tenant isolation, CSP | Complete |
| [monitoring.md](monitoring.md) | Health checks, metrics, logging | Complete |
| [edge-cases.md](edge-cases.md) | Error handling, validation, edge cases | Complete |

## Cross-References

- VERIFY: AE-ARCH-001 — App module wires guards, filters, interceptors
- VERIFY: AE-AUTH-001 — JWT strategy validates token structure
- VERIFY: AE-AUTH-002 — Registration validates unique email
- VERIFY: AE-AUTH-003 — Auth service uses bcryptjs for password hashing
- VERIFY: AE-AUTH-004 — Rate limiting on auth endpoints
- VERIFY: AE-AUTH-005 — JWT strategy extracts bearer token
- VERIFY: AE-DATA-001 — Prisma service implements lifecycle hooks
- VERIFY: AE-DATA-002 — Prisma client extends PrismaClient
- VERIFY: AE-SEC-001 — JWT auth guard checks IS_PUBLIC_KEY
- VERIFY: AE-SEC-002 — @Public decorator sets metadata
- VERIFY: AE-SEC-003 — Roles guard checks ROLES_KEY metadata
- VERIFY: AE-SEC-004 — Tenant isolation via RLS policies
- VERIFY: AE-SEC-005 — CSP headers with frameAncestors none
- VERIFY: AE-SEC-006 — CORS configuration with allowed origins
- VERIFY: AE-SEC-007 — Validation pipe rejects unknown fields
- VERIFY: AE-SEC-008 — x-powered-by header disabled
- VERIFY: AE-SEC-009 — @Roles('ADMIN') on delete endpoints
- VERIFY: AE-SEC-010 — setTenantContext uses parameterized SQL
- VERIFY: AE-MON-001 — Health endpoint returns status and version
- VERIFY: AE-MON-002 — Metrics endpoint tracks request counts
- VERIFY: AE-MON-003 — Correlation ID middleware
- VERIFY: AE-MON-004 — Request logging with Pino
- VERIFY: AE-MON-005 — Global exception filter with log sanitization
- VERIFY: AE-PERF-001 — Response time interceptor adds X-Response-Time
- VERIFY: AE-PERF-002 — Pagination limits max page size
- VERIFY: AE-PERF-003 — ThrottlerModule with three tiers
- VERIFY: AE-PERF-004 — CacheModule registered in app module
- VERIFY: AE-PERF-005 — CacheControlInterceptor on GET list endpoints
- VERIFY: AE-DASH-001 — Dashboard service CRUD with tenant scoping
- VERIFY: AE-DASH-002 — Dashboard controller delegates to service
- VERIFY: AE-WIDGET-001 — Widget service CRUD with tenant scoping
- VERIFY: AE-WIDGET-002 — Widget controller delegates to service
- VERIFY: AE-DS-001 — DataSource service CRUD with tenant scoping
- VERIFY: AE-DS-002 — DataSource controller delegates to service
- VERIFY: AE-FE-001 — Root layout with lang and title
- VERIFY: AE-FE-002 — Home page with navigation
- VERIFY: AE-FE-003 — Error boundaries with useRef focus
- VERIFY: AE-FE-004 — Dashboard page with server data fetching
- VERIFY: AE-FE-005 — Login page with form validation
- VERIFY: AE-FE-006 — Server actions with httpOnly cookie storage
- VERIFY: AE-FE-007 — Reusable UI components (Button, Card, Input, etc.)
- VERIFY: AE-INFRA-001 — Bootstrap with env validation and helmet
- VERIFY: AE-INFRA-002 — Dockerfile multi-stage build
- VERIFY: AE-INFRA-003 — Docker Compose with PostgreSQL
- VERIFY: AE-INFRA-004 — CI/CD pipeline with GitHub Actions
