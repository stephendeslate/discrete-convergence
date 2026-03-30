# API Endpoints Specification

## Overview
Fleet Dispatch exposes a RESTful API built with NestJS 11. All endpoints
require JWT authentication unless marked as @Public.

## Authentication
- POST /auth/login — Login with email/password — VERIFY: FD-AUTH-001
- POST /auth/register — Register new company — VERIFY: FD-AUTH-002
- POST /auth/refresh — Refresh token pair

## Companies
- GET /companies/me — Get current company profile — VERIFY: FD-COMP-002
- PATCH /companies/me — Update company (ADMIN only)

## Work Orders
- POST /work-orders — Create work order (ADMIN/DISPATCHER) — VERIFY: FD-WO-003
- GET /work-orders — List work orders (paginated)
- GET /work-orders/:id — Get work order detail
- PATCH /work-orders/:id — Update work order
- PATCH /work-orders/:id/status — Update status (state machine validated)
- PATCH /work-orders/:id/assign — Assign technician

## Technicians
- POST /technicians — Create technician (ADMIN/DISPATCHER) — VERIFY: FD-TECH-002
- GET /technicians — List technicians (paginated)
- GET /technicians/available — List available technicians
- GET /technicians/:id — Get technician detail
- PATCH /technicians/:id — Update technician
- GET /technicians/:id/schedule — Get daily schedule
- PATCH /technicians/:id/gps — Update GPS location

## Customers
- POST /customers — Create customer (ADMIN/DISPATCHER) — VERIFY: FD-CUST-002
- GET /customers — List customers (paginated)
- GET /customers/:id — Get customer detail
- PATCH /customers/:id — Update customer
- GET /customers/:id/work-orders — List customer work orders

## Routes
- POST /routes/optimize — Optimize route — VERIFY: FD-ROUTE-002
- GET /routes/:date — Get routes by date
- PATCH /routes/:id/reorder — Reorder stops

## Invoices
- POST /invoices/work-orders/:workOrderId — Create invoice — VERIFY: FD-INV-003
- PATCH /invoices/:id/send — Send invoice
- PATCH /invoices/:id/pay — Mark as paid
- PATCH /invoices/:id/void — Void invoice
- GET /invoices — List invoices (paginated)

## Photos
- POST /work-orders/:workOrderId/photos — Upload photo — VERIFY: FD-PHOTO-002
- GET /work-orders/:workOrderId/photos — List photos

## Notifications
- GET /notifications — List user notifications — VERIFY: FD-NOTIF-002
- PATCH /notifications/:id/read — Mark as read

## Tracking (Public)
- GET /track/:token — Public work order tracking — VERIFY: FD-TRACK-002

## Audit
- GET /audit-log — List audit logs (ADMIN only) — VERIFY: FD-AUDIT-002

## Health & Monitoring
- GET /health — Liveness check (public) — VERIFY: FD-INFRA-003
- GET /health/ready — Readiness check (public)
- GET /metrics — Application metrics — VERIFY: FD-MON-006
- GET /monitoring — Uptime status — VERIFY: FD-MON-007

## Placeholder Endpoints (SE-R)
- GET /dashboards — Returns [] — VERIFY: FD-DASH-001
- GET /data-sources — Returns [] — VERIFY: FD-DS-001

## Pagination
All list endpoints accept ?page=N&limit=N query parameters.
Default page size: 20, max: 100 — VERIFY: FD-API-001
- Default page size constant exported from shared package — VERIFY: FD-API-002

## Service Responsibilities
- AuditService: audit log retrieval for compliance — VERIFY: FD-AUDIT-001
- CustomerService: customer CRUD and work order lookup — VERIFY: FD-CUST-001
- NotificationService: notification retrieval for authenticated users — VERIFY: FD-NOTIF-001
- PhotoService: job photo upload and retrieval — VERIFY: FD-PHOTO-001
- RouteService: route optimization and management — VERIFY: FD-ROUTE-001
- TechnicianService: technician records and availability — VERIFY: FD-TECH-001
- WorkOrderService: work order CRUD and state machine — VERIFY: FD-WO-002

## Cross-References
- See [authentication.md](authentication.md) for auth flow details
- See [data-model.md](data-model.md) for entity schemas
- See [security.md](security.md) for access control
