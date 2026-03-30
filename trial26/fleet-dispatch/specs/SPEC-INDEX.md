# Fleet Dispatch Specification Index

## Core Specifications
- [Authentication](authentication.md) - Auth flows, JWT, bcryptjs
- [Data Model](data-model.md) - Prisma schema, enums, relations
- [API Endpoints](api-endpoints.md) - REST API contracts
- [Frontend](frontend.md) - Next.js pages, components, actions
- [Infrastructure](infrastructure.md) - Docker, CI/CD, deployment
- [Security](security.md) - Helmet, CORS, RLS, validation
- [Monitoring](monitoring.md) - Health checks, metrics, logging
- [Edge Cases](edge-cases.md) - Boundary conditions, error handling

## Domain Specifications
- [Vehicles](vehicles.md) - Vehicle CRUD, status management
- [Drivers](drivers.md) - Driver CRUD, availability
- [Routes](routes.md) - Route management
- [Dispatches](dispatches.md) - Dispatch state machine
- [Maintenance](maintenance.md) - Maintenance scheduling
- [Trips](trips.md) - Trip tracking
- [Zones](zones.md) - Zone management

## VERIFY Tags

<!-- VERIFY:FD-AUTH-004 — Authentication uses bcryptjs with salt rounds 12 -->
<!-- VERIFY:FD-APP-002 — ThrottlerModule limit >= 20000 -->
<!-- VERIFY:FD-APP-004 — Global JWT auth guard respecting @Public() decorator -->
<!-- VERIFY:FD-MON-001 — Health endpoints at /health and /health/ready -->
<!-- VERIFY:FD-APP-007 — ValidationPipe with forbidNonWhitelisted -->
<!-- VERIFY:FD-APP-005 — Helmet with CSP directives -->
<!-- VERIFY:FD-APP-006 — CORS returning Access-Control-Allow-Origin -->
<!-- VERIFY:FD-INFRA-001 — PrismaService setTenantContext with $executeRaw -->
<!-- VERIFY:FD-INFRA-002 — RLS policies on all tenanted tables -->
<!-- VERIFY:FD-AUTH-010 — Login endpoint rate limited at 10/min -->
<!-- VERIFY:MAIN-BOOTSTRAP — app.enableShutdownHooks() in main.ts -->
<!-- VERIFY:FD-APP-001 — Root application module -->
<!-- VERIFY:FD-COMMON-001 — ESLint 9 flat config -->
<!-- VERIFY:FD-INFRA-003 — Docker api service with HEALTHCHECK -->
<!-- VERIFY:FD-SHARED-001 — Shared constants and utilities barrel export -->
<!-- VERIFY:FD-WEB-001 — cn() utility with clsx + tailwind-merge -->
<!-- VERIFY:FD-WEB-002 — Server actions with use server directive -->
<!-- VERIFY:FD-WEB-003 — Domain route pages -->
<!-- VERIFY:FD-WEB-004 — Component files -->
<!-- VERIFY:FD-WEB-005 — Form components -->
<!-- VERIFY:FD-DSP-003 — Dispatch state machine with branching -->
<!-- VERIFY:FD-VEH-003 — Vehicle activate/deactivate with branching -->
<!-- VERIFY:FD-DRV-003 — Driver status management with branching -->
<!-- VERIFY:FD-MNT-003 — Maintenance complete with vehicle status restore -->
<!-- VERIFY:FD-TRP-003 — Trip create validates dispatch status -->
<!-- VERIFY:FD-AUTH-001 — Register DTO with validation -->
<!-- VERIFY:FD-AUTH-002 — Login DTO with validation -->
<!-- VERIFY:FD-APP-003 — Global guards, filters, interceptors -->
<!-- VERIFY:FD-COMMON-002 — HttpExceptionFilter -->
<!-- VERIFY:FD-COMMON-003 — CorrelationInterceptor -->
<!-- VERIFY:FD-COMMON-004 — ResponseTimeInterceptor -->
<!-- VERIFY:FD-COMMON-005 — TenantGuard -->
<!-- VERIFY:FD-COMMON-006 — Pagination utilities -->
<!-- VERIFY:FD-SHARED-005 — Pagination types and utilities -->
<!-- VERIFY:FD-TEST-001 — Test utilities with mocked PrismaService -->
<!-- VERIFY:FD-SHARED-002 — Correlation ID utilities -->
<!-- VERIFY:FD-SHARED-003 — Log sanitization utilities -->
<!-- VERIFY:FD-SHARED-004 — Environment variable validation -->
<!-- VERIFY:FD-AUTH-005 — Register with duplicate email check -->
<!-- VERIFY:FD-AUTH-006 — Login with password verification -->
<!-- VERIFY:FD-AUTH-011 — Auth module configuration -->
<!-- VERIFY:FD-MON-002 — Monitoring metrics -->
<!-- VERIFY:FD-AUTH-003 — Refresh token DTO -->
<!-- VERIFY:FD-AUTH-007 — Token refresh -->
<!-- VERIFY:FD-AUTH-008 — JWT strategy -->
<!-- VERIFY:FD-AUTH-009 — Auth controller with rate limiting -->
<!-- VERIFY:FD-COMMON-007 — Auth utility with role check -->
<!-- VERIFY:FD-COMMON-008 — Pagination utilities -->
<!-- VERIFY:FD-DRV-001 — Create driver DTO -->
<!-- VERIFY:FD-DRV-002 — Update driver DTO -->
<!-- VERIFY:FD-DRV-004 — Driver controller -->
<!-- VERIFY:FD-DRV-005 — Driver module -->
<!-- VERIFY:FD-DRV-006 — Driver service -->
<!-- VERIFY:FD-DSP-001 — Create dispatch DTO -->
<!-- VERIFY:FD-DSP-002 — Dispatch service with state machine -->
<!-- VERIFY:FD-DSP-004 — Dispatch controller -->
<!-- VERIFY:FD-DSP-005 — Dispatch module -->
<!-- VERIFY:FD-DSP-006 — Update dispatch DTO -->
<!-- VERIFY:FD-DSP-007 — Transition dispatch DTO -->
<!-- VERIFY:FD-MNT-001 — Create maintenance DTO -->
<!-- VERIFY:FD-MNT-002 — Update maintenance DTO -->
<!-- VERIFY:FD-MNT-004 — Maintenance controller -->
<!-- VERIFY:FD-MNT-005 — Maintenance module -->
<!-- VERIFY:FD-MNT-006 — Maintenance service -->
<!-- VERIFY:FD-MON-004 — Monitoring module -->
<!-- VERIFY:FD-MON-005 — Metrics controller -->
<!-- VERIFY:FD-RTE-001 — Create route DTO -->
<!-- VERIFY:FD-RTE-002 — Update route DTO -->
<!-- VERIFY:FD-RTE-003 — Route controller -->
<!-- VERIFY:FD-RTE-004 — Route service -->
<!-- VERIFY:FD-TRP-001 — Create trip DTO -->
<!-- VERIFY:FD-TRP-002 — Update trip DTO -->
<!-- VERIFY:FD-TRP-004 — Trip controller -->
<!-- VERIFY:FD-TRP-005 — Trip module -->
<!-- VERIFY:FD-TRP-006 — Trip service -->
<!-- VERIFY:FD-VEH-001 — Create vehicle DTO -->
<!-- VERIFY:FD-VEH-002 — Update vehicle DTO -->
<!-- VERIFY:FD-VEH-004 — Vehicle controller -->
<!-- VERIFY:FD-VEH-005 — Vehicle module -->
<!-- VERIFY:FD-VEH-006 — Vehicle service -->
<!-- VERIFY:FD-ZNE-001 — Create zone DTO -->
<!-- VERIFY:FD-ZNE-002 — Update zone DTO -->
<!-- VERIFY:FD-ZNE-003 — Zone service -->
<!-- VERIFY:FD-ZNE-004 — Zone controller -->
<!-- VERIFY:FD-MON-003 — Health endpoint responds under 100ms -->
<!-- VERIFY:WEB-LAYOUT — App layout -->
<!-- VERIFY:FD-WEB-006 — Web page: vehicles -->
<!-- VERIFY:FD-WEB-007 — Web page: drivers -->
<!-- VERIFY:FD-WEB-008 — Web page: routes -->
<!-- VERIFY:FD-WEB-009 — Web page: dispatches -->
<!-- VERIFY:FD-WEB-010 — Web page: trips -->
<!-- VERIFY:FD-WEB-012 — Web page: maintenance -->
<!-- VERIFY:FD-WEB-013 — Web page: zones -->
<!-- VERIFY:FD-WEB-014 — Web page: dashboard -->
<!-- VERIFY:FD-WEB-015 — Web page: settings -->
<!-- VERIFY:FD-WEB-016 — Web page: login -->
<!-- VERIFY:FD-WEB-017 — Web page: register -->
<!-- VERIFY:FD-WEB-018 — Web component: VehicleCard -->
<!-- VERIFY:FD-WEB-019 — Web component: DriverCard -->
<!-- VERIFY:FD-WEB-020 — Web component: DispatchCard -->
<!-- VERIFY:FD-WEB-021 — Web component: RouteCard -->
<!-- VERIFY:FD-WEB-022 — Web component: TripCard -->
<!-- VERIFY:FD-WEB-023 — Web component: MaintenanceCard -->
<!-- VERIFY:FD-WEB-024 — Web component: ZoneCard -->
<!-- VERIFY:FD-WEB-025 — Web component: Navbar -->
<!-- VERIFY:FD-WEB-026 — Web component: ThemeToggle -->
<!-- VERIFY:FD-WEB-027 — Web component: StatusBadge -->
<!-- VERIFY:FD-WEB-028 — Web form: VehicleForm -->
<!-- VERIFY:FD-WEB-029 — Web form: DispatchForm -->
<!-- VERIFY:FD-WEB-030 — Web form: DriverForm -->
<!-- VERIFY:FD-WEB-031 — Web form: MaintenanceForm -->
<!-- VERIFY:FD-WEB-032 — Web form: TripForm -->
<!-- VERIFY:EC-AUTH-EMPTY — Edge case: empty auth credentials -->
<!-- VERIFY:EC-AUTH-INVALID — Edge case: invalid auth token -->
<!-- VERIFY:EC-DUPLICATE-CONFLICT — Edge case: duplicate resource conflict -->
<!-- VERIFY:EC-FORBIDDEN-OWNERSHIP — Edge case: forbidden ownership access -->
<!-- VERIFY:EC-INPUT-BOUNDARY — Edge case: input boundary values -->
<!-- VERIFY:EC-NOT-FOUND — Edge case: resource not found -->
<!-- VERIFY:EC-OVERFLOW-PAGINATION — Edge case: overflow pagination values -->
<!-- VERIFY:EC-TIMEOUT-HANDLING — Edge case: timeout handling -->
<!-- VERIFY:TEST-AUTH-CTRL — Auth controller tests -->
<!-- VERIFY:TEST-AUTH-UTILS — Auth utility tests -->
<!-- VERIFY:TEST-DISPATCH-CTRL — Dispatch controller tests -->
<!-- VERIFY:TEST-DRIVER-CTRL — Driver controller tests -->
<!-- VERIFY:TEST-EDGE-CASES — Edge case integration tests -->
<!-- VERIFY:TEST-MAINTENANCE-CTRL — Maintenance controller tests -->
<!-- VERIFY:TEST-MONITORING-CTRL — Monitoring controller tests -->
<!-- VERIFY:TEST-PAGINATION-UTILS — Pagination utility tests -->
<!-- VERIFY:TEST-PERFORMANCE — Performance tests -->
<!-- VERIFY:TEST-ROUTE-CTRL — Route controller tests -->
<!-- VERIFY:TEST-SECURITY — Security tests -->
<!-- VERIFY:TEST-TENANT-GUARD — Tenant guard tests -->
<!-- VERIFY:TEST-TRIP-CTRL — Trip controller tests -->
<!-- VERIFY:TEST-VEHICLE-CTRL — Vehicle controller tests -->
<!-- VERIFY:TEST-WEB-ACTIONS — Web actions tests -->
<!-- VERIFY:TEST-WEB-API — Web API client tests -->
<!-- VERIFY:TEST-ZONE-CTRL — Zone controller tests -->
<!-- VERIFY:FD-ACT-001 — Server actions export createVehicle -->
<!-- VERIFY:FD-ACT-002 — Server actions export createDispatch -->
<!-- VERIFY:FD-ACT-003 — Server actions export deleteVehicle -->
<!-- VERIFY:FD-ACT-004 — Server actions export loginAction -->
<!-- VERIFY:FD-ACT-005 — Server actions export registerAction -->
<!-- VERIFY:FD-API-001 — API client makes GET by default -->
<!-- VERIFY:FD-API-002 — API client includes auth token -->
<!-- VERIFY:FD-API-003 — API client throws on non-ok response -->
<!-- VERIFY:FD-AUTH-INT-001 — Auth integration: register creates user and returns tokens -->
<!-- VERIFY:FD-AUTH-INT-002 — Auth integration: register rejects invalid email -->
<!-- VERIFY:FD-CTRL-001 — AuthController register returns tokens -->
<!-- VERIFY:FD-CTRL-002 — AuthController login returns tokens -->
<!-- VERIFY:FD-EDGE-001 — Edge case: empty pagination returns valid structure -->
<!-- VERIFY:FD-EDGE-002 — Edge case: invalid UUID format rejected -->
<!-- VERIFY:FD-EDGE-003 — Edge case: XSS in string fields sanitized by validation -->
<!-- VERIFY:FD-EDGE-004 — Edge case: concurrent dispatch creation for same vehicle -->
<!-- VERIFY:FD-EDGE-005 — Edge case: dispatch state machine prevents invalid transitions -->
<!-- VERIFY:FD-EDGE-006 — Edge case: maintenance on vehicle with active dispatch -->
<!-- VERIFY:FD-EDGE-007 — Edge case: trip creation for cancelled dispatch rejected -->
<!-- VERIFY:FD-EDGE-008 — Edge case: driver deletion while on duty rejected -->
<!-- VERIFY:FD-EDGE-009 — Edge case: vehicle deactivation with active dispatch rejected -->
<!-- VERIFY:FD-EDGE-010 — Edge case: boundary values for pagination -->
<!-- VERIFY:FD-GUARD-001 — TenantGuard allows valid tenant context -->
<!-- VERIFY:FD-GUARD-002 — TenantGuard rejects missing tenant -->
<!-- VERIFY:FD-PAGE-001 — buildSkipTake computes correct offset for page 1 -->
<!-- VERIFY:FD-PAGE-002 — buildSkipTake computes correct offset for later pages -->
<!-- VERIFY:FD-PERF-001 — Performance: health endpoint responds under 100ms -->
<!-- VERIFY:FD-PERF-002 — Performance: paginated list responds under 200ms -->
<!-- VERIFY:FD-SEC-001 — Security: unauthenticated access rejected -->
<!-- VERIFY:FD-SEC-002 — Security: helmet CSP headers present -->
<!-- VERIFY:FD-SEC-003 — Security: CORS headers present -->
<!-- VERIFY:FD-SEC-004 — Security: invalid JWT rejected -->
<!-- VERIFY:FD-SEC-005 — Security: SQL injection in query params rejected -->
<!-- VERIFY:FD-UTIL-001 — extractUserFromRequest returns authenticated user -->
<!-- VERIFY:FD-UTIL-002 — extractUserFromRequest throws when no user -->
<!-- VERIFY:FD-UTIL-003 — requireRole allows permitted roles -->
<!-- VERIFY:FD-UTIL-004 — requireRole rejects unauthorized roles -->
<!-- VERIFY:FD-VEH-INT-001 — Vehicles integration: list returns paginated data -->
<!-- VERIFY:FD-VEH-INT-002 — Vehicles integration: requires authentication -->
<!-- VERIFY:FD-VEH-INT-003 — Vehicles integration: create returns new vehicle -->
<!-- VERIFY:FD-COMMON-009 — Public decorator for fully-public endpoints -->
<!-- VERIFY:FD-WEB-033 — Vehicle page actions re-export -->
<!-- VERIFY:FD-WEB-034 — Dispatch page actions re-export -->
