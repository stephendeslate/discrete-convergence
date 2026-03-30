# Fleet Dispatch — Specification Index

## Project Information

- **Project:** Fleet Dispatch (FD)
- **Domain:** Fleet management and vehicle dispatch platform
- **Trial:** 7 (Discrete Convergence Experiment)
- **Methodology:** CED v0.7-dc
- **Tag Prefix:** FD

## Specification Documents

| Document | Description | Tags |
|----------|-------------|------|
| [authentication.md](authentication.md) | JWT auth, registration, login flow | FD-AUTH-001 through FD-AUTH-008 |
| [data-model.md](data-model.md) | Entity schemas, Prisma models, indexes | FD-DATA-001, FD-DATA-002 |
| [api-endpoints.md](api-endpoints.md) | REST API routes, DTOs, controllers | FD-VEH-*, FD-DRV-*, FD-RTE-*, FD-DSP-*, FD-MNT-*, FD-AUD-* |
| [frontend.md](frontend.md) | Next.js pages, components, accessibility | FD-UI-*, FD-FE-*, FD-AX-* |
| [infrastructure.md](infrastructure.md) | Docker, CI/CD, migrations, seed | FD-INFRA-001 through FD-INFRA-004 |
| [security.md](security.md) | Guards, CSP, rate limiting, validation | FD-SEC-001 through FD-SEC-007 |
| [monitoring.md](monitoring.md) | Logging, correlation, health, metrics | FD-MON-001 through FD-MON-010 |
| [cross-layer.md](cross-layer.md) | Integration points, provider chain | FD-CROSS-001, FD-PERF-001 through FD-PERF-006 |

## Domain Entities

- **User** — Authentication and authorization
- **Tenant** — Multi-tenant isolation
- **Vehicle** — Fleet vehicle management
- **Driver** — Driver profile management
- **Route** — Dispatch route planning
- **Dispatch** — Vehicle-driver-route assignment
- **MaintenanceRecord** — Vehicle maintenance tracking
- **AuditLog** — Action audit trail

## Tag Registry

### Authentication (FD-AUTH)
- FD-AUTH-001: Registration DTO validation
- FD-AUTH-002: Login DTO validation
- FD-AUTH-003: Bcrypt salt rounds from shared
- FD-AUTH-004: Allowed registration roles
- FD-AUTH-005: AuthService implementation
- FD-AUTH-006: AuthController endpoints
- FD-AUTH-007: JWT strategy
- FD-AUTH-008: Auth module configuration

### Data Model (FD-DATA)
- FD-DATA-001: PrismaService lifecycle
- FD-DATA-002: Raw SQL dispatch stats

### Vehicle (FD-VEH)
- FD-VEH-001: Create vehicle DTO
- FD-VEH-002: Update vehicle DTO
- FD-VEH-003: Vehicle service CRUD
- FD-VEH-004: Vehicle controller routes

### Driver (FD-DRV)
- FD-DRV-001: Create driver DTO
- FD-DRV-002: Update driver DTO
- FD-DRV-003: Driver service CRUD
- FD-DRV-004: Driver controller routes

### Route (FD-RTE)
- FD-RTE-001: Create route DTO
- FD-RTE-002: Update route DTO
- FD-RTE-003: Route service CRUD
- FD-RTE-004: Route controller routes

### Dispatch (FD-DSP)
- FD-DSP-001: Create dispatch DTO
- FD-DSP-002: Update dispatch DTO
- FD-DSP-003: Dispatch service CRUD
- FD-DSP-004: Dispatch controller routes

### Maintenance (FD-MNT)
- FD-MNT-001: Create maintenance DTO
- FD-MNT-002: Update maintenance DTO
- FD-MNT-003: Maintenance service CRUD
- FD-MNT-004: Maintenance controller routes

### Audit (FD-AUD)
- FD-AUD-001: Create audit log DTO
- FD-AUD-002: Audit service
- FD-AUD-003: Audit controller

### Security (FD-SEC)
- FD-SEC-001: Log sanitizer sensitive keys
- FD-SEC-002: Log sanitizer recursive handling
- FD-SEC-003: JwtAuthGuard global guard
- FD-SEC-004: RolesGuard implementation
- FD-SEC-005: Public decorator
- FD-SEC-006: Roles decorator
- FD-SEC-007: Global exception filter

### Monitoring (FD-MON)
- FD-MON-001: Correlation ID generation
- FD-MON-002: Log entry interface
- FD-MON-003: Log entry formatter
- FD-MON-004: Pino logger service
- FD-MON-005: Correlation ID middleware
- FD-MON-006: Request context service
- FD-MON-007: Request logging middleware
- FD-MON-008: Health endpoint
- FD-MON-009: Readiness endpoint
- FD-MON-010: Metrics service

### Frontend (FD-UI, FD-FE, FD-AX)
- FD-UI-001: cn() utility
- FD-UI-002: Login server action
- FD-UI-003: Register server action
- FD-UI-004: Session helper
- FD-UI-005: Frontend error reporting
- FD-UI-006: Nav component
- FD-FE-001: Root layout
- FD-FE-002: Login page
- FD-FE-003: Register page
- FD-AX-001: Accessibility tests
- FD-AX-002: Keyboard navigation tests

### Infrastructure (FD-INFRA)
- FD-INFRA-001: APP_VERSION constant
- FD-INFRA-002: Environment validation
- FD-INFRA-003: Bootstrap configuration
- FD-INFRA-004: Seed script

### Cross-Layer (FD-CROSS, FD-PERF)
- FD-CROSS-001: AppModule provider chain
- FD-PERF-001: MAX_PAGE_SIZE constant
- FD-PERF-002: DEFAULT_PAGE_SIZE constant
- FD-PERF-003: Pagination params interface
- FD-PERF-004: Pagination clamping
- FD-PERF-005: Response time interceptor
- FD-PERF-006: Paginated query DTO

## Cross-References

- Authentication spec references security.md for sanitization
- Data model spec references api-endpoints.md for operations
- Frontend spec references authentication.md for auth flow
- Infrastructure spec references data-model.md for schema
- Security spec references authentication.md for auth details
- Monitoring spec references security.md for error sanitization
- Cross-layer spec integrates all other specifications

## Total Tags: 72 VERIFY tags across 8 specification documents
