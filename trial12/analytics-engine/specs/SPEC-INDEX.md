# Specification Index — Analytics Engine

## Overview

This document indexes all specification files and their VERIFY requirement tags
for the Analytics Engine project (CED Trial 12, v1.3-dc methodology).

Total specifications: 8 documents
Total VERIFY tags: 50+

## Specification Documents

| Document | Domain | VERIFY Tags | Description |
|----------|--------|-------------|-------------|
| [Authentication](authentication.md) | AUTH | AE-AUTH-001..008 | JWT auth, bcryptjs, login/register |
| [Data Model](data-model.md) | DATA | AE-DATA-001..005 | Prisma schema, enums, indexes |
| [API Endpoints](api-endpoints.md) | DASH, WIDGET, DS, QUERY | AE-DASH-001..003, AE-WIDGET-001..003, AE-DS-001..004, AE-QUERY-001..003 | REST endpoints, DTOs, pagination |
| [Frontend](frontend.md) | UI | AE-UI-001..004 | Next.js pages, components, layout |
| [Infrastructure](infrastructure.md) | INFRA | AE-INFRA-001..002 | Docker, CI/CD, monorepo, env config |
| [Security](security.md) | SEC | AE-SEC-001..006 | Guards, decorators, validation, hardening |
| [Monitoring](monitoring.md) | MON | AE-MON-001..009 | Logging, correlation IDs, health checks |
| [Cross-Layer](cross-layer.md) | CROSS, FI, PERF, AX | AE-CROSS-001..002, AE-FI-001..002, AE-PERF-001..005, AE-AX-001..004 | Integration, performance, accessibility |

## VERIFY Tag Registry

### Authentication (AE-AUTH)
- AE-AUTH-001 — BCRYPT_SALT_ROUNDS = 12 in shared constants
- AE-AUTH-002 — ALLOWED_REGISTRATION_ROLES excludes ADMIN
- AE-AUTH-003 — JwtModule.registerAsync with no hardcoded secret fallback
- AE-AUTH-004 — AuthService register/login with bcryptjs
- AE-AUTH-005 — AuthController with @Public() on both endpoints
- AE-AUTH-006 — RegisterDto with @IsEmail, @MaxLength, @IsIn(ALLOWED_REGISTRATION_ROLES)
- AE-AUTH-007 — LoginDto with @IsEmail, @IsString
- AE-AUTH-008 — JwtStrategy extracts and validates JWT payload

### Data Model (AE-DATA)
- AE-DATA-001 — User model with role enum and tenantId
- AE-DATA-002 — Dashboard model with status enum
- AE-DATA-003 — Widget model with type enum and JSON config
- AE-DATA-004 — DataSource model with type and status enums
- AE-DATA-005 — QueryExecution model with Decimal cost

### Dashboard (AE-DASH)
- AE-DASH-001 — Dashboard DTOs with class-validator decorators
- AE-DASH-002 — DashboardService with tenant-scoped CRUD
- AE-DASH-003 — DashboardController with @Roles('ADMIN') on delete

### Widget (AE-WIDGET)
- AE-WIDGET-001 — Widget DTOs with class-validator decorators
- AE-WIDGET-002 — WidgetService with tenant-scoped CRUD
- AE-WIDGET-003 — WidgetController with Cache-Control on findAll

### Data Source (AE-DS)
- AE-DS-001 — DataSource DTOs with class-validator decorators
- AE-DS-002 — DataSourceService with tenant-scoped CRUD
- AE-DS-003 — DataSourceService connection test uses $executeRaw with Prisma.sql
- AE-DS-004 — DataSourceController with @Roles('ADMIN') on create/update/delete

### Query (AE-QUERY)
- AE-QUERY-001 — Query DTOs with class-validator decorators
- AE-QUERY-002 — QueryService with tenant-scoped CRUD
- AE-QUERY-003 — QueryController with standard CRUD endpoints

### Security (AE-SEC)
- AE-SEC-001 — validateEnvVars checks required variables at startup
- AE-SEC-002 — @Public() decorator sets IS_PUBLIC_KEY metadata
- AE-SEC-003 — @Roles() decorator sets ROLES_KEY metadata
- AE-SEC-004 — RolesGuard reads ROLES_KEY and checks user role
- AE-SEC-005 — JwtAuthGuard checks IS_PUBLIC_KEY to skip auth
- AE-SEC-006 — main.ts bootstrap with Helmet, CORS, ValidationPipe

### Monitoring (AE-MON)
- AE-MON-001 — createCorrelationId generates unique request trace ID
- AE-MON-002 — formatLogEntry produces structured log output
- AE-MON-003 — sanitizeLogContext redacts sensitive fields recursively
- AE-MON-004 — GlobalExceptionFilter with correlationId and no stack traces
- AE-MON-005 — CorrelationIdMiddleware with X-Correlation-ID header
- AE-MON-006 — RequestLoggingMiddleware with formatLogEntry
- AE-MON-007 — RequestContextService is request-scoped
- AE-MON-008 — MonitoringService with health, readiness, metrics
- AE-MON-009 — MonitoringController all @Public() with @SkipThrottle on health

### Performance (AE-PERF)
- AE-PERF-001 — MAX_PAGE_SIZE constant (100)
- AE-PERF-002 — DEFAULT_PAGE_SIZE constant (20)
- AE-PERF-003 — clampPageSize, clampPage, calculateSkip utilities
- AE-PERF-004 — ResponseTimeInterceptor with performance.now()
- AE-PERF-005 — buildPaginationParams uses shared pagination utilities

### Frontend (AE-UI)
- AE-UI-001 — cn() utility with clsx + tailwind-merge
- AE-UI-002 — Nav component with navigation links
- AE-UI-003 — RootLayout with Nav and global styles
- AE-UI-004 — DashboardPage with server-side data fetching

### Frontend Integration (AE-FI)
- AE-FI-001 — API_ROUTES with single-quoted route strings
- AE-FI-002 — Server actions with httpOnly cookie auth

### Accessibility (AE-AX)
- AE-AX-001 — Loading states with role="status" and aria-busy
- AE-AX-002 — Error boundaries with role="alert" and focus management
- AE-AX-003 — jest-axe tests on real page components
- AE-AX-004 — Keyboard navigation tests with userEvent

### Cross-Layer (AE-CROSS)
- AE-CROSS-001 — Shared package consumed by both API and web
- AE-CROSS-002 — AppModule global wiring of guards, filter, interceptor

### Infrastructure (AE-INFRA)
- AE-INFRA-001 — Seed script with BCRYPT_SALT_ROUNDS from shared
- AE-INFRA-002 — Environment validation at startup via validateEnvVars

## Cross-References

Each specification document includes cross-references to related specs.
All VERIFY tags have corresponding TRACED tags in .ts/.tsx source files.
