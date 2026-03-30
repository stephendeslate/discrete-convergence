# Fleet Dispatch — Specification Index

## Overview

This index catalogs all specification documents for the Fleet Dispatch project.
Fleet Dispatch is a multi-tenant field service dispatch platform for managing
work orders, tracking technicians, optimizing routes, and invoicing customers.

## Specification Documents

| # | Document | Description | VERIFY Tags |
|---|----------|-------------|-------------|
| 1 | [authentication.md](authentication.md) | JWT auth, bcrypt, registration flow | FD-AUTH-001 through FD-AUTH-004 |
| 2 | [data-model.md](data-model.md) | Prisma schema, RLS, indexing, state machines | FD-DATA-001, FD-WO-001, FD-WO-002, FD-INV-001 |
| 3 | [api-endpoints.md](api-endpoints.md) | REST endpoints, CRUD, pagination | FD-WO-003, FD-WO-004, FD-TECH-001, FD-TECH-002, FD-INV-002 through FD-INV-004, FD-CUST-001, FD-CUST-002, FD-PERF-003 |
| 4 | [frontend.md](frontend.md) | Next.js, shadcn/ui, dark mode, accessibility | FD-UI-001 through FD-UI-005, FD-AX-001, FD-AX-002 |
| 5 | [security.md](security.md) | Helmet CSP, rate limiting, CORS, validation | FD-SEC-001 through FD-SEC-004 |
| 6 | [monitoring.md](monitoring.md) | Health, metrics, logging, correlation IDs | FD-MON-001 through FD-MON-007 |
| 7 | [infrastructure.md](infrastructure.md) | Docker, CI/CD, monorepo, shared package | FD-INFRA-001, FD-ARCH-001, FD-PERF-001, FD-PERF-002, FD-CROSS-001, FD-UI-005 |
| 8 | [cross-layer.md](cross-layer.md) | Cross-layer integration, shared imports | (references above tags) |

## VERIFY Tag Registry

### Authentication (4 tags)
- VERIFY:FD-AUTH-001 — Auth service implementation (login, register, refresh)
- VERIFY:FD-AUTH-002 — Auth controller routes (@Public on login/register)
- VERIFY:FD-AUTH-003 — Registration DTO validation (role restriction)
- VERIFY:FD-AUTH-004 — JWT strategy (bearer token extraction)

### Data Model (1 tag)
- VERIFY:FD-DATA-001 — Raw SQL execution ($queryRaw with Prisma.sql)

### Work Orders (4 tags)
- VERIFY:FD-WO-001 — Work order status state machine
- VERIFY:FD-WO-002 — Status transition with history
- VERIFY:FD-WO-003 — Work order controller CRUD
- VERIFY:FD-WO-004 — Work order service unit tests

### Technicians (2 tags)
- VERIFY:FD-TECH-001 — Technician service CRUD + availability
- VERIFY:FD-TECH-002 — Technician controller routes

### Invoices (4 tags)
- VERIFY:FD-INV-001 — Invoice status machine
- VERIFY:FD-INV-002 — Invoice send operation
- VERIFY:FD-INV-003 — Invoice controller routes
- VERIFY:FD-INV-004 — Invoice service unit tests

### Customers (2 tags)
- VERIFY:FD-CUST-001 — Customer service CRUD
- VERIFY:FD-CUST-002 — Customer controller routes

### Security (4 tags)
- VERIFY:FD-SEC-001 — Public decorator
- VERIFY:FD-SEC-002 — JWT auth guard as APP_GUARD
- VERIFY:FD-SEC-003 — Bootstrap security configuration
- VERIFY:FD-SEC-004 — Security integration tests

### Monitoring (7 tags)
- VERIFY:FD-MON-001 — Health endpoints
- VERIFY:FD-MON-002 — Correlation ID middleware
- VERIFY:FD-MON-003 — Request context service
- VERIFY:FD-MON-004 — Request logging middleware
- VERIFY:FD-MON-005 — Global exception filter
- VERIFY:FD-MON-006 — Monitoring integration tests
- VERIFY:FD-MON-007 — Log sanitizer tests

### UI & Accessibility (7 tags)
- VERIFY:FD-UI-001 — cn() utility (clsx + tailwind-merge)
- VERIFY:FD-UI-002 — Server actions (response.ok check)
- VERIFY:FD-UI-003 — Navigation component (APP_VERSION)
- VERIFY:FD-UI-004 — Dynamic imports (next/dynamic)
- VERIFY:FD-UI-005 — Dark mode CSS (@media prefers-color-scheme)
- VERIFY:FD-AX-001 — Accessibility tests (jest-axe)
- VERIFY:FD-AX-002 — Keyboard navigation tests (userEvent)

### Infrastructure & Architecture (3 tags)
- VERIFY:FD-INFRA-001 — Seed script (BCRYPT_SALT_ROUNDS, error handling)
- VERIFY:FD-ARCH-001 — AppModule provider chain
- VERIFY:FD-CROSS-001 — Cross-layer integration test

### Performance (3 tags)
- VERIFY:FD-PERF-001 — Response time interceptor
- VERIFY:FD-PERF-002 — Performance integration tests
- VERIFY:FD-PERF-003 — Paginated response format

## Cross-References

- authentication.md references security.md
- data-model.md references api-endpoints.md and security.md
- api-endpoints.md references authentication.md and data-model.md
- frontend.md references api-endpoints.md
- security.md references authentication.md
- cross-layer.md references security.md and monitoring.md
- infrastructure.md references (self-contained with shared package details)

## Total: 41 VERIFY tags
