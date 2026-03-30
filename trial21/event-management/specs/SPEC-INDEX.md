# Spec Index — Event Management Platform

## Overview
This document indexes all specification files for the Event Management Platform.
Each spec contains domain requirements, VERIFY tags, and cross-references.

## Spec Files

| File | Domain | Description |
|------|--------|-------------|
| [authentication.md](authentication.md) | Auth | JWT auth, login, register, refresh |
| [data-model.md](data-model.md) | Data | Prisma schema, entities, relations |
| [api-endpoints.md](api-endpoints.md) | API | REST endpoints, DTOs, validation |
| [frontend.md](frontend.md) | FE | Next.js pages, server actions, a11y |
| [infrastructure.md](infrastructure.md) | Infra | Docker, CI/CD, env config |
| [security.md](security.md) | Sec | Guards, RLS, throttling, validation |
| [monitoring.md](monitoring.md) | Mon | Logging, metrics, correlation IDs |

## Cross-References
- Authentication spec references Security spec for guard configuration
- API Endpoints spec references Data Model for entity definitions
- Frontend spec references API Endpoints for route matching
- Infrastructure spec references Security for env var validation
- Monitoring spec references Infrastructure for Pino configuration
- Security spec references Authentication for JWT strategy
- Data Model spec references Security for RLS policies
- API Endpoints spec references Frontend for client-side route matching

## VERIFY Tag Ranges

### Authentication (authentication.md)
- EM-AUTH-001 to EM-AUTH-003: Login, register, refresh, JWT strategy

### Security (security.md)
- EM-SEC-001 to EM-SEC-003: Bcrypt, allowed roles, log sanitization
- EM-SEC-005 to EM-SEC-012: RLS, public decorator, roles guard, DTOs, JWT guard, negative tests

### Events and Sessions (api-endpoints.md)
- EM-EVT-001 to EM-EVT-006: Event DTOs, status transitions, controller, sessions, public discovery

### Registration (api-endpoints.md)
- EM-REG-001 to EM-REG-005: Registration DTO, capacity checks, waitlist promotion, endpoints

### Check-in (api-endpoints.md)
- EM-CHK-001 to EM-CHK-003: Idempotent scanning, check-in endpoints

### Waitlist (api-endpoints.md)
- EM-WTL-001: FIFO promotion

### Notifications (api-endpoints.md)
- EM-NTF-001: Broadcast DTO

### Audit (monitoring.md)
- EM-AUD-001: Audit log service

### API Utilities (api-endpoints.md)
- EM-API-001 to EM-API-004: Pagination constants, paginated query DTO, skip/take builder

### Monitoring (monitoring.md)
- EM-MON-001 to EM-MON-005: Correlation IDs, Pino logging, response time, metrics

### Infrastructure (infrastructure.md)
- EM-INF-001 to EM-INF-007: App version, env validation, health, placeholders, app module

### Frontend (frontend.md)
- EM-FE-001 to EM-FE-016: Server actions, layout, pages, components

### Testing (api-endpoints.md)
- EM-TST-001 to EM-TST-002: Mock Prisma factory, centralized fixtures

### Edge Cases (security.md)
- EM-EDGE-001 to EM-EDGE-010: Past events, sold-out, status transitions, timezone, idempotent check-in

### Venues and Tickets (api-endpoints.md)
- EM-VEN-001: Venue DTO with capacity validation
- EM-TKT-001 to EM-TKT-002: Ticket type DTO (cents), tenant-isolated CRUD

### Data Model (data-model.md)
- EM-DM-001 to EM-DM-003: Prisma schema mapping, enum mapping, composite indexes

## Total VERIFY Tags: 79
