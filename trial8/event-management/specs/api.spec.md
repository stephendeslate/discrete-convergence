# API Spec

## EM-API-001 — Event CRUD
- **VERIFY**: `test/event.integration.spec.ts` — Create, update, delete events
- Admin and Organizer roles can create/update; Admin can delete.

## EM-API-002 — Event List with Pagination
- **VERIFY**: `test/event.integration.spec.ts` — List events returns paginated results
- Uses clampPagination from shared.

## EM-API-003 — Event Get by ID
- **VERIFY**: `test/event.integration.spec.ts` — Get event by ID; 404 for non-existent
- Uses findFirst with tenantId for tenant isolation.

## EM-API-004 — Ticket Service CRUD
- **TRACED**: `apps/api/src/ticket/ticket.service.ts`
- **VERIFY**: `test/ticket.integration.spec.ts` — Create, update ticket status
- Tenant-scoped with findFirst.

## EM-API-005 — Ticket Controller
- **TRACED**: `apps/api/src/ticket/ticket.controller.ts`
- **VERIFY**: `test/ticket.integration.spec.ts` — List tickets, get by ID, 404

## EM-API-006 — Attendee Service CRUD
- **TRACED**: `apps/api/src/attendee/attendee.service.ts`
- **VERIFY**: `test/cross-layer.integration.spec.ts` — Attendee registration flow

## EM-API-007 — Attendee Controller
- **TRACED**: `apps/api/src/attendee/attendee.controller.ts`
- @Roles('ADMIN') on delete endpoint.

## EM-API-008 — Schedule Service CRUD
- **TRACED**: `apps/api/src/schedule/schedule.service.ts`
- **VERIFY**: `test/cross-layer.integration.spec.ts` — Schedule creation in full flow

## EM-API-009 — Schedule Controller
- **TRACED**: `apps/api/src/schedule/schedule.controller.ts`
- @Roles on create and delete endpoints.

## EM-API-010 — Health Endpoint
- **TRACED**: `apps/api/src/health/health.controller.ts`
- **VERIFY**: `test/security.spec.ts` — Health endpoint is public

## EM-API-011 — Fetch Events List (Frontend)
- **TRACED**: `apps/web/lib/actions.ts` — getEvents()

## EM-API-012 — Fetch Single Event (Frontend)
- **TRACED**: `apps/web/lib/actions.ts` — getEvent()

## Verification Tags
- VERIFY: EM-API-004
- VERIFY: EM-API-005
- VERIFY: EM-API-006
- VERIFY: EM-API-007
- VERIFY: EM-API-008
- VERIFY: EM-API-009
- VERIFY: EM-API-010
- VERIFY: EM-API-011
- VERIFY: EM-API-012
