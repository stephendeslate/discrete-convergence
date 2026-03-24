# API Endpoints Specification

## Overview

FleetDispatch exposes REST endpoints for CRUD operations and WebSocket gateways
for real-time GPS streaming and dispatch events.

## App Module

- VERIFY:FD-MAIN-001 — main.ts configures CORS, helmet, compression, global validation pipe
- VERIFY:FD-APP-001 — AppModule imports all 13 domain modules + PrismaModule

## Work Order Endpoints

- VERIFY:FD-WO-005 — WorkOrderController exposes CRUD + status transition + assignment
- POST /work-orders — create work order
- GET /work-orders — list with pagination, Cache-Control header
- GET /work-orders/:id — find by ID
- PATCH /work-orders/:id — update fields
- PATCH /work-orders/:id/status — transition status (validates against state machine)
- PATCH /work-orders/:id/assign — assign technician

### Work Order State Machine

- VERIFY:FD-WO-001 — 9 states: UNASSIGNED→ASSIGNED→EN_ROUTE→ON_SITE→IN_PROGRESS→COMPLETED→INVOICED→PAID
- VERIFY:FD-WO-002 — CANCELLED allowed from any state except PAID
- VERIFY:FD-WO-003 — Invalid transitions throw BadRequestException
- VERIFY:FD-WO-004 — Status history recorded on every transition

## Invoice Endpoints

- VERIFY:FD-INV-001 — createFromWorkOrder validates COMPLETED status, calculates totals
- VERIFY:FD-INV-002 — send validates DRAFT status before transitioning to SENT
- POST /invoices/work-order/:workOrderId — create from completed work order
- PATCH /invoices/:id/send — send draft invoice
- GET /invoices — list with pagination

## GPS WebSocket Gateway

- VERIFY:FD-GPS-001 — GpsGateway handles position updates from technicians
- VERIFY:FD-GPS-002 — Supports subscribe and subscribeWorkOrder events
- WebSocket namespace: /gps

## Dispatch WebSocket Gateway

- VERIFY:FD-DISPATCH-001 — DispatchGateway broadcasts assignment and status changes
- WebSocket namespace: /dispatch

## Other Endpoints

- VERIFY:FD-TECH-001 — TechnicianService.findAll with pagination
- VERIFY:FD-TECH-002 — TechnicianService.findAvailable returns available technicians
- VERIFY:FD-CUST-001 — CustomerService with CRUD operations
- VERIFY:FD-ROUTE-001 — RouteService.optimize creates optimized route
- VERIFY:FD-ROUTE-002 — RouteService.reorder allows manual stop reordering
- VERIFY:FD-TRACK-001 — TrackingService.findByToken validates token expiry (24h)
- VERIFY:FD-PHOTO-001 — PhotoService.addPhoto enforces MAX_WORK_ORDER_PHOTOS limit
- VERIFY:FD-NOTIF-001 — NotificationService.create sends notifications
- VERIFY:FD-NOTIF-002 — NotificationService.markRead updates status

## Pagination

- VERIFY:FD-PAG-001 — clampPage/clampLimit from shared clamp (not reject) invalid values
- VERIFY:FD-PERF-004 — Cache-Control: private, max-age=60 on list endpoints

## Cross-References

- See [Data Model](./data-model.md) for entity definitions
- See [Authentication](./authentication.md) for guard configuration
- See [Monitoring](./monitoring.md) for request logging
- VERIFY:FD-TEST-002 — Integration test covers work order CRUD and state transitions
- VERIFY:FD-TEST-008 — Unit test covers work order service state machine validation
- VERIFY:FD-TEST-009 — Unit test covers invoice service state validation
