# Specification Index — Event Management Platform (EM)

## Project Prefix: EM

This document indexes all specification files and their VERIFY tags for the
event-management project, Trial 13 of the CED v1.4-dc experiment.

## Specification Files

| File | Domain | VERIFY Tags | Lines |
|------|--------|-------------|-------|
| [authentication.md](authentication.md) | Auth & JWT | EM-AUTH-001 to EM-AUTH-006 | 58 |
| [data-model.md](data-model.md) | Prisma Schema & Types | EM-DATA-001 to EM-DATA-005 | 58 |
| [api-endpoints.md](api-endpoints.md) | Domain Controllers | EM-EVENT-001/002, EM-VENUE-001/002, EM-ATTENDEE-001/002, EM-REG-001/002 | 72 |
| [frontend.md](frontend.md) | Next.js Web App | EM-UI-001 to EM-UI-003, EM-FI-001 | 61 |
| [infrastructure.md](infrastructure.md) | Docker, CI, Env | EM-INFRA-001, EM-INFRA-002 | 67 |
| [security.md](security.md) | Guards, Filters, RBAC | EM-SEC-001 to EM-SEC-005 | 69 |
| [monitoring.md](monitoring.md) | Logging, Health, Metrics | EM-MON-001 to EM-MON-009 | 64 |
| [cross-layer.md](cross-layer.md) | Shared, Perf, Integration | EM-SHARED-001/002, EM-PERF-001 to EM-PERF-005, EM-CROSS-001 | 65 |

## VERIFY Tag Summary

Total VERIFY tags: 47

### Authentication (6)
- EM-AUTH-001 — BCRYPT_SALT_ROUNDS from shared, set to 12
- EM-AUTH-002 — ALLOWED_REGISTRATION_ROLES restricts to VIEWER
- EM-AUTH-003 — RegisterDto class-validator decorators
- EM-AUTH-004 — AuthService registration and login with bcryptjs
- EM-AUTH-005 — AuthController @Public endpoints
- EM-AUTH-006 — AuthModule JwtModule 1h expiry

### Data Model (5)
- EM-DATA-001 — UserRole enum mapped to snake_case
- EM-DATA-002 — EventStatus enum mapped to snake_case
- EM-DATA-003 — RegistrationStatus enum
- EM-DATA-004 — PrismaService lifecycle hooks
- EM-DATA-005 — $executeRaw tenant context with Prisma.sql

### API Endpoints (8)
- EM-EVENT-001 — EventService tenant-scoped CRUD
- EM-EVENT-002 — EventController @Req() + @Roles
- EM-VENUE-001 — VenueService tenant-scoped CRUD
- EM-VENUE-002 — VenueController @Req() tenant extraction
- EM-ATTENDEE-001 — AttendeeService tenant-scoped CRUD
- EM-ATTENDEE-002 — AttendeeController @Req() tenant extraction
- EM-REG-001 — RegistrationService tenant-scoped CRUD
- EM-REG-002 — RegistrationController @Req() tenant extraction

### Frontend (4)
- EM-UI-001 — cn() utility with clsx + tailwind-merge
- EM-UI-002 — Root layout with Nav and metadata
- EM-UI-003 — Button component variants and sizes
- EM-FI-001 — Server actions auth token storage and headers

### Infrastructure (2)
- EM-INFRA-001 — validateEnvVars at startup
- EM-INFRA-002 — main.ts Helmet, CORS, ValidationPipe

### Security (5)
- EM-SEC-001 — @Public decorator IS_PUBLIC_KEY
- EM-SEC-002 — @Roles decorator ROLES_KEY
- EM-SEC-003 — RolesGuard JWT role check
- EM-SEC-004 — JwtStrategy Bearer token extraction
- EM-SEC-005 — JwtAuthGuard @Public bypass

### Monitoring (9)
- EM-MON-001 — createCorrelationId with randomUUID
- EM-MON-002 — LogEntry structured format
- EM-MON-003 — formatLogEntry JSON strings
- EM-MON-004 — sanitizeLogContext recursive redaction
- EM-MON-005 — GlobalExceptionFilter sanitization
- EM-MON-006 — CorrelationIdMiddleware
- EM-MON-007 — RequestLoggingMiddleware
- EM-MON-008 — RequestContextService request-scoped
- EM-MON-009 — MonitoringController @Public endpoints

### Cross-Layer (8)
- EM-SHARED-001 — Shared constants exports
- EM-SHARED-002 — Shared index re-exports
- EM-PERF-001 — MAX_PAGE_SIZE = 100
- EM-PERF-002 — DEFAULT_PAGE_SIZE = 20
- EM-PERF-003 — clampPagination page >= 1
- EM-PERF-004 — clampPagination pageSize clamping
- EM-PERF-005 — ResponseTimeInterceptor X-Response-Time
- EM-CROSS-001 — AppModule guard/filter/interceptor registration
