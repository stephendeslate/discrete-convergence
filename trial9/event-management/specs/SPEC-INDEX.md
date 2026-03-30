# Specification Index

## Overview

This index catalogs all specifications for the Event Management platform,
listing every VERIFY tag and its corresponding TRACED tag location.

## Specification Files

| File | Description | Tag Count |
|------|-------------|-----------|
| [authentication.md](authentication.md) | JWT auth, registration, guards | 9 |
| [data-model.md](data-model.md) | Prisma schema, raw queries | 2 |
| [api-endpoints.md](api-endpoints.md) | REST controllers and routes | 6 |
| [frontend.md](frontend.md) | Next.js UI and server actions | 7 |
| [infrastructure.md](infrastructure.md) | Docker, CI/CD, monorepo | 4 |
| [security.md](security.md) | RBAC, tenant isolation, headers | 2 |
| [monitoring.md](monitoring.md) | Logging, health, error handling | 8 |
| [cross-layer.md](cross-layer.md) | Integration verification | 15 |

**Total VERIFY tags: 53**

## Tag Registry

### Authentication (EM-AUTH-*)

- EM-AUTH-001 — Password hashing uses BCRYPT_SALT_ROUNDS from shared
- EM-AUTH-002 — Only ALLOWED_REGISTRATION_ROLES can self-register
- EM-AUTH-003 — Public decorator exempts routes from JWT guard
- EM-AUTH-004 — Global JwtAuthGuard registered as APP_GUARD
- EM-AUTH-005 — Auth module registers JWT with configurable secret
- EM-AUTH-006 — Auth service validates credentials and returns JWT
- EM-AUTH-007 — JWT strategy extracts token from Bearer header
- EM-AUTH-008 — Register DTO validates with class-validator
- EM-AUTH-009 — Login DTO validates email and password

### Data Model (EM-DATA-*)

- EM-DATA-001 — Auth service uses $executeRaw with Prisma.sql
- EM-DATA-002 — PrismaService extends PrismaClient with lifecycle hooks

### API Endpoints (EM-API-*)

- EM-API-001 — Auth controller with public register and login
- EM-API-002 — Event controller with full CRUD
- EM-API-003 — Venue controller with full CRUD
- EM-API-004 — Ticket controller with admin-only delete
- EM-API-005 — Attendee controller with duplicate prevention
- EM-API-006 — Schedule controller with full CRUD

### Frontend - UI (EM-UI-*)

- EM-UI-001 — cn() utility uses clsx + tailwind-merge
- EM-UI-002 — Navigation component in root layout
- EM-UI-003 — Button component with variant and size props

### Frontend - Integration (EM-FI-*)

- EM-FI-001 — API route constants as single-quoted strings
- EM-FI-002 — Login action stores token via cookies().set
- EM-FI-003 — Register action posts and redirects
- EM-FI-004 — Protected actions read token and pass Authorization header

### Infrastructure (EM-INFRA-*)

- EM-INFRA-001 — validateEnvVars validates required env vars
- EM-INFRA-002 — Shared package exports >= 8 utilities
- EM-INFRA-003 — AppModule registers global providers
- EM-INFRA-004 — main.ts bootstraps with Helmet, CORS, ValidationPipe

### Security (EM-SEC-*)

- EM-SEC-001 — TenantId decorator extracts tenantId from JWT
- EM-SEC-002 — RolesGuard checks @Roles() metadata

### Monitoring (EM-MON-*)

- EM-MON-001 — APP_VERSION exported from shared
- EM-MON-002 — createCorrelationId generates UUID
- EM-MON-003 — formatLogEntry produces structured JSON
- EM-MON-004 — sanitizeLogContext redacts sensitive fields
- EM-MON-005 — GlobalExceptionFilter catches all exceptions
- EM-MON-006 — CorrelationIdMiddleware preserves/generates correlation ID
- EM-MON-007 — RequestLoggingMiddleware logs request details
- EM-MON-008 — Monitoring controller provides health/metrics endpoints

### Cross-Layer Domain (EM-EVENT/VENUE/TICKET/ATTEND/SCHED/PERF-*)

- EM-EVENT-001 — CreateEventDto validates with class-validator
- EM-EVENT-002 — Event service implements CRUD with tenant isolation
- EM-VENUE-001 — CreateVenueDto validates name, address, capacity
- EM-VENUE-002 — Venue service implements CRUD with pagination
- EM-TICKET-001 — CreateTicketDto validates eventId, type, price
- EM-TICKET-002 — Ticket service implements CRUD with tenant isolation
- EM-ATTEND-001 — CreateAttendeeDto validates eventId and userId
- EM-ATTEND-002 — Attendee service prevents duplicate registration
- EM-SCHED-001 — CreateScheduleDto validates eventId, title, times
- EM-SCHED-002 — Schedule service validates end time after start time
- EM-PERF-001 — MAX_PAGE_SIZE constant (100) from shared
- EM-PERF-002 — DEFAULT_PAGE_SIZE constant (20) from shared
- EM-PERF-003 — parsePagination clamps to MAX_PAGE_SIZE
- EM-PERF-004 — Pagination utility wraps shared parsePagination
- EM-PERF-005 — ResponseTimeInterceptor sets X-Response-Time header
