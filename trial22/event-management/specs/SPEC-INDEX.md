# Specification Index

## Overview

This index catalogs all specification documents and their VERIFY/TRACED tag mappings
for the Event Management platform (Trial 22).

## Specification Files

| File | Description | VERIFY Count |
|------|-------------|--------------|
| [authentication.md](authentication.md) | JWT auth, registration, login flow | 5 |
| [data-model.md](data-model.md) | Prisma schema, entities, RLS | 3 |
| [api-endpoints.md](api-endpoints.md) | REST API endpoints and CRUD operations | 18 |
| [frontend.md](frontend.md) | Next.js 15 app, UI components, accessibility | 0 |
| [infrastructure.md](infrastructure.md) | Docker, CI/CD, shared package | 3 |
| [security.md](security.md) | Guards, validation, RLS, headers | 8 |
| [monitoring.md](monitoring.md) | Logging, health checks, performance | 6 |
| [cross-layer.md](cross-layer.md) | Integration between layers | 0 |
| [edge-cases.md](edge-cases.md) | Edge cases and boundary conditions | 10 |

## VERIFY Tag Registry

### Authentication (EM-AUTH-*)
- EM-AUTH-001: JwtAuthGuard as APP_GUARD → jwt-auth.guard.ts
- EM-AUTH-002: RegisterDto role validation → auth/dto/register.dto.ts
- EM-AUTH-003: JwtStrategy Bearer extraction → auth/jwt.strategy.ts
- EM-AUTH-004: AuthService password hashing → auth/auth.service.ts
- EM-AUTH-005: AuthController rate limiting → auth/auth.controller.ts

### Security (EM-SEC-*)
- EM-SEC-001: APP_GUARD JwtAuthGuard → app.module.ts
- EM-SEC-002: APP_GUARD ThrottlerGuard → app.module.ts
- EM-SEC-003: RolesGuard role checking → common/roles.guard.ts
- EM-SEC-004: Env var validation → main.ts
- EM-SEC-005: Helmet CSP → main.ts
- EM-SEC-006: CORS configuration → main.ts
- EM-SEC-007: ValidationPipe setup → main.ts
- EM-SEC-008: setTenantContext RLS → infra/prisma.service.ts

### Data (EM-DATA-*)
- EM-DATA-001: PrismaService connect → infra/prisma.service.ts
- EM-DATA-002: PrismaService lifecycle → infra/prisma.service.ts
- EM-DATA-003: EventService pagination → event/event.service.ts

### Monitoring (EM-MON-*)
- EM-MON-001: CorrelationIdMiddleware → common/correlation-id.middleware.ts
- EM-MON-002: RequestLoggingMiddleware → common/request-logging.middleware.ts
- EM-MON-003: GlobalExceptionFilter → common/global-exception.filter.ts
- EM-MON-004: HealthController → health/health.controller.ts

### Performance (EM-PERF-*)
- EM-PERF-001: ResponseTimeInterceptor → common/response-time.interceptor.ts
- EM-PERF-004: CacheControlInterceptor → common/cache-control.interceptor.ts

### Domain (EM-{DOMAIN}-*)
- EM-EVENT-001: EventService CRUD → event/event.service.ts
- EM-EVENT-002: EventController → event/event.controller.ts
- EM-VENUE-001: VenueService → venue/venue.service.ts
- EM-VENUE-002: VenueController → venue/venue.controller.ts
- EM-TICKET-001: TicketService → ticket/ticket.service.ts
- EM-TICKET-002: TicketController → ticket/ticket.controller.ts
- EM-ATTENDEE-001: AttendeeService → attendee/attendee.service.ts
- EM-ATTENDEE-002: AttendeeController → attendee/attendee.controller.ts
- EM-REG-001: RegistrationService → registration/registration.service.ts
- EM-REG-002: RegistrationController → registration/registration.controller.ts
- EM-SPEAKER-001: SpeakerService → speaker/speaker.service.ts
- EM-SESSION-001: SessionService → session/session.service.ts
- EM-SPONSOR-001: SponsorService → sponsor/sponsor.service.ts
- EM-CAT-001: CategoryService → category/category.service.ts
- EM-NOTIF-001: NotificationService → notification/notification.service.ts
- EM-TTYPE-001: TicketTypeService → ticket-type/ticket-type.service.ts
- EM-AUDIT-001: AuditLogService → audit-log/audit-log.service.ts
- EM-AUDIT-002: AuditLogController → audit-log/audit-log.controller.ts

### Shared (EM-SHARED-*)
- EM-SHARED-001: Constants → packages/shared/src/index.ts
- EM-SHARED-002: Utilities → packages/shared/src/index.ts
- EM-SHARED-003: Validators → packages/shared/src/index.ts

## Cross-References

- authentication.md references: security.md, api-endpoints.md
- data-model.md references: security.md, infrastructure.md
- api-endpoints.md references: authentication.md, security.md
- frontend.md references: authentication.md, api-endpoints.md
- infrastructure.md references: data-model.md, monitoring.md
- security.md references: authentication.md, monitoring.md, api-endpoints.md
- monitoring.md references: security.md, infrastructure.md, api-endpoints.md
- cross-layer.md references: authentication.md, security.md, monitoring.md, data-model.md
