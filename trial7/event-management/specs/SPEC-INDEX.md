# Event Management — Specification Index

## Project Information

- **Project:** Event Management (EM)
- **Domain:** Event planning and ticketing platform
- **Trial:** 7 (discrete-convergence)
- **Methodology:** CED v0.7-dc
- **Tag Prefix:** EM

## Specification Documents

| # | Document | Description | Key Tags |
|---|----------|-------------|----------|
| 1 | [authentication.md](authentication.md) | JWT auth, registration, login flow | EM-AUTH-001..006 |
| 2 | [data-model.md](data-model.md) | Prisma schema, entities, RLS, indexes | EM-DATA-001..003 |
| 3 | [api-endpoints.md](api-endpoints.md) | CRUD endpoints, DTOs, controllers | EM-EVT-*, EM-TKT-*, EM-VEN-*, EM-CAT-*, EM-AUD-* |
| 4 | [frontend.md](frontend.md) | Next.js app, components, accessibility | EM-FE-001..009, EM-AX-001..002 |
| 5 | [security.md](security.md) | Guards, RBAC, CSP, validation, audit | EM-SEC-001..008 |
| 6 | [monitoring.md](monitoring.md) | Logging, health, metrics, correlation | EM-MON-001..009 |
| 7 | [infrastructure.md](infrastructure.md) | Docker, CI/CD, seed, env validation | EM-INFRA-001..003 |
| 8 | [cross-layer.md](cross-layer.md) | Integration, performance, architecture | EM-ARCH-001, EM-PERF-001..005 |

## Tag Registry

### Authentication (EM-AUTH)
- EM-AUTH-001: RegisterDto with class-validator
- EM-AUTH-002: LoginDto with class-validator
- EM-AUTH-003: AuthService register/login implementation
- EM-AUTH-004: AuthController with @Public() endpoints
- EM-AUTH-005: JwtStrategy token extraction and validation
- EM-AUTH-006: AuthModule configuration

### Data Model (EM-DATA)
- EM-DATA-001: PrismaService lifecycle management
- EM-DATA-002: $executeRaw with Prisma.sql template
- EM-DATA-003: Row Level Security on all tables

### Events (EM-EVT)
- EM-EVT-001: CreateEventDto validation
- EM-EVT-002: UpdateEventDto validation
- EM-EVT-003: EventService CRUD operations
- EM-EVT-004: EventController routing

### Tickets (EM-TKT)
- EM-TKT-001: CreateTicketDto validation
- EM-TKT-002: UpdateTicketDto validation
- EM-TKT-003: TicketService CRUD operations
- EM-TKT-004: TicketController routing

### Venues (EM-VEN)
- EM-VEN-001: CreateVenueDto validation
- EM-VEN-002: UpdateVenueDto validation
- EM-VEN-003: VenueService CRUD operations
- EM-VEN-004: VenueController with @Roles

### Categories (EM-CAT)
- EM-CAT-001: CreateCategoryDto validation
- EM-CAT-002: UpdateCategoryDto validation
- EM-CAT-003: CategoryService CRUD operations
- EM-CAT-004: CategoryController with @Roles

### Audit Logs (EM-AUD)
- EM-AUD-001: CreateAuditLogDto validation
- EM-AUD-002: AuditLogService operations
- EM-AUD-003: AuditLogController with admin-only list

### Security (EM-SEC)
- EM-SEC-001: @Public() decorator
- EM-SEC-002: @Roles() decorator
- EM-SEC-003: RolesGuard implementation
- EM-SEC-004: JwtAuthGuard global guard
- EM-SEC-005: RBAC on event endpoints
- EM-SEC-006: APP_GUARD registrations in AppModule
- EM-SEC-007: Helmet CSP configuration
- EM-SEC-008: ValidationPipe configuration

### Monitoring (EM-MON)
- EM-MON-001: GlobalExceptionFilter
- EM-MON-002: PinoLoggerService
- EM-MON-003: RequestContextService
- EM-MON-004: CorrelationIdMiddleware
- EM-MON-005: RequestLoggingMiddleware
- EM-MON-006: MetricsService
- EM-MON-007: Health endpoint
- EM-MON-008: Readiness endpoint
- EM-MON-009: APP_FILTER registration

### Performance (EM-PERF)
- EM-PERF-001: ResponseTimeInterceptor
- EM-PERF-002: PaginatedQueryDto
- EM-PERF-003: clampPagination usage
- EM-PERF-004: Cache-Control headers
- EM-PERF-005: APP_INTERCEPTOR registration

### Frontend (EM-FE)
- EM-FE-001: Error reporting endpoint
- EM-FE-002: cn() utility
- EM-FE-003: Server Actions
- EM-FE-004: Root layout
- EM-FE-005: Dynamic import with Skeleton
- EM-FE-006: Navigation component
- EM-FE-007: Error boundary
- EM-FE-008: Dashboard page
- EM-FE-009: Login page

### Accessibility (EM-AX)
- EM-AX-001: jest-axe component tests
- EM-AX-002: Keyboard navigation tests

### Architecture (EM-ARCH)
- EM-ARCH-001: AppModule global provider chain

### Infrastructure (EM-INFRA)
- EM-INFRA-001: Bootstrap with validateEnvVars
- EM-INFRA-002: Seed script
- EM-INFRA-003: Dockerfile configuration

## Total Tags: 65
## Cross-References: All spec documents reference at least 2 other specs
