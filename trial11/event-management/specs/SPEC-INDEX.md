# Specification Index

## Project: Event Management System

### Spec Files

| File | Domain | VERIFY Tags | Status |
|------|--------|-------------|--------|
| [authentication.md](authentication.md) | Auth | EM-AUTH-001..007 | Complete |
| [data-model.md](data-model.md) | Data | EM-DATA-001..002, EM-SHARED-001, EM-INFRA-001 | Complete |
| [api-endpoints.md](api-endpoints.md) | API | EM-API-001, EM-ARCH-001, EM-EVENT-001..003, EM-VENUE-001..003, EM-TICKET-001..003, EM-SCHED-001..003, EM-ATTEND-001..003 | Complete |
| [frontend.md](frontend.md) | UI | EM-UI-001..006, EM-FI-001..004, EM-AX-001..002 | Complete |
| [infrastructure.md](infrastructure.md) | Infra | EM-INFRA-001 | Complete |
| [security.md](security.md) | Security | EM-SEC-001..008 | Complete |
| [monitoring.md](monitoring.md) | Monitoring | EM-MON-001..011, EM-PERF-001..006 | Complete |
| [cross-layer.md](cross-layer.md) | Integration | EM-CROSS-001, EM-FI-001..004 | Complete |

### Tag Registry

| Tag | Spec File | Source File |
|-----|-----------|-------------|
| EM-SHARED-001 | data-model.md | packages/shared/src/constants.ts |
| EM-AUTH-001 | authentication.md | packages/shared/src/constants.ts |
| EM-AUTH-002 | authentication.md | packages/shared/src/constants.ts |
| EM-AUTH-003 | authentication.md | apps/api/src/auth/auth.service.ts |
| EM-AUTH-004 | authentication.md | apps/api/src/auth/auth.controller.ts |
| EM-AUTH-005 | authentication.md | apps/api/src/auth/jwt.strategy.ts |
| EM-AUTH-006 | authentication.md | apps/api/src/auth/dto/register.dto.ts |
| EM-AUTH-007 | authentication.md | apps/api/src/auth/dto/login.dto.ts |
| EM-SEC-001 | security.md | packages/shared/src/constants.ts |
| EM-SEC-002 | security.md | packages/shared/src/env-validation.ts |
| EM-SEC-003 | security.md | apps/api/src/common/public.decorator.ts |
| EM-SEC-004 | security.md | apps/api/src/common/roles.decorator.ts |
| EM-SEC-005 | security.md | apps/api/src/common/roles.guard.ts |
| EM-SEC-006 | security.md | apps/api/src/auth/jwt-auth.guard.ts |
| EM-SEC-007 | security.md | apps/api/src/main.ts |
| EM-SEC-008 | security.md | apps/api/test/security.spec.ts |
| EM-MON-001 | monitoring.md | packages/shared/src/correlation.ts |
| EM-MON-002 | monitoring.md | packages/shared/src/log-format.ts |
| EM-MON-003 | monitoring.md | packages/shared/src/log-format.ts |
| EM-MON-004 | monitoring.md | packages/shared/src/log-sanitizer.ts |
| EM-MON-005 | monitoring.md | packages/shared/src/log-sanitizer.ts |
| EM-MON-006 | monitoring.md | apps/api/src/common/global-exception.filter.ts |
| EM-MON-007 | monitoring.md | apps/api/src/common/correlation-id.middleware.ts |
| EM-MON-008 | monitoring.md | apps/api/src/common/request-logging.middleware.ts |
| EM-MON-009 | monitoring.md | apps/api/src/monitoring/monitoring.controller.ts |
| EM-MON-010 | monitoring.md | apps/api/src/monitoring/monitoring.service.ts |
| EM-MON-011 | monitoring.md | apps/api/test/monitoring.spec.ts |
| EM-PERF-001 | monitoring.md | packages/shared/src/constants.ts |
| EM-PERF-002 | monitoring.md | packages/shared/src/constants.ts |
| EM-PERF-003 | monitoring.md | packages/shared/src/pagination.ts |
| EM-PERF-004 | monitoring.md | packages/shared/src/pagination.ts |
| EM-PERF-005 | monitoring.md | apps/api/src/common/response-time.interceptor.ts |
| EM-PERF-006 | monitoring.md | apps/api/test/performance.spec.ts |
| EM-DATA-001 | data-model.md | apps/api/src/common/prisma.service.ts |
| EM-DATA-002 | data-model.md | apps/api/src/event/event.service.ts |
| EM-API-001 | api-endpoints.md | packages/shared/src/constants.ts |
| EM-ARCH-001 | api-endpoints.md | apps/api/src/app.module.ts |
| EM-EVENT-001 | api-endpoints.md | apps/api/src/event/dto/create-event.dto.ts |
| EM-EVENT-002 | api-endpoints.md | apps/api/src/event/event.service.ts |
| EM-EVENT-003 | api-endpoints.md | apps/api/src/event/event.controller.ts |
| EM-VENUE-001 | api-endpoints.md | apps/api/src/venue/dto/create-venue.dto.ts |
| EM-VENUE-002 | api-endpoints.md | apps/api/src/venue/venue.service.ts |
| EM-VENUE-003 | api-endpoints.md | apps/api/src/venue/venue.controller.ts |
| EM-TICKET-001 | api-endpoints.md | apps/api/src/ticket/dto/create-ticket.dto.ts |
| EM-TICKET-002 | api-endpoints.md | apps/api/src/ticket/ticket.service.ts |
| EM-TICKET-003 | api-endpoints.md | apps/api/src/ticket/ticket.controller.ts |
| EM-SCHED-001 | api-endpoints.md | apps/api/src/schedule/dto/create-schedule.dto.ts |
| EM-SCHED-002 | api-endpoints.md | apps/api/src/schedule/schedule.service.ts |
| EM-SCHED-003 | api-endpoints.md | apps/api/src/schedule/schedule.controller.ts |
| EM-ATTEND-001 | api-endpoints.md | apps/api/src/attendee/dto/create-attendee.dto.ts |
| EM-ATTEND-002 | api-endpoints.md | apps/api/src/attendee/attendee.service.ts |
| EM-ATTEND-003 | api-endpoints.md | apps/api/src/attendee/attendee.controller.ts |
| EM-INFRA-001 | data-model.md | apps/api/prisma/seed.ts |
| EM-UI-001 | frontend.md | apps/web/lib/utils.ts |
| EM-UI-002 | frontend.md | apps/web/components/ui/button.tsx |
| EM-UI-003 | frontend.md | apps/web/components/nav.tsx |
| EM-UI-004 | frontend.md | apps/web/app/layout.tsx |
| EM-UI-005 | frontend.md | apps/web/app/login/page.tsx |
| EM-UI-006 | frontend.md | apps/web/app/dashboard/page.tsx |
| EM-FI-001 | cross-layer.md | apps/web/lib/actions.ts |
| EM-FI-002 | cross-layer.md | apps/web/lib/actions.ts |
| EM-FI-003 | cross-layer.md | apps/web/lib/actions.ts |
| EM-FI-004 | cross-layer.md | apps/web/lib/actions.ts |
| EM-AX-001 | frontend.md | apps/web/__tests__/accessibility.spec.tsx |
| EM-AX-002 | frontend.md | apps/web/__tests__/keyboard.spec.tsx |
| EM-CROSS-001 | cross-layer.md | apps/api/test/cross-layer.integration.spec.ts |

### Summary

- **Total VERIFY tags**: 66
- **Total TRACED tags**: 66
- **Orphaned VERIFY tags**: 0
- **Orphaned TRACED tags**: 0
- **Spec files**: 8 (7 required + 1 cross-layer)
