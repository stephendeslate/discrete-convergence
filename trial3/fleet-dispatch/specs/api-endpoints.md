# API Endpoints Specification

## Overview

Fleet Dispatch API runs on NestJS 11 with JWT authentication.
All domain endpoints require authentication via Bearer token.
Public endpoints are decorated with @Public().
See [authentication.md](authentication.md) for auth details.

## Authentication Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/register | Public | Register new user |
| POST | /auth/login | Public | Login and get JWT |

## Work Order Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /work-orders | Required | Create work order |
| GET | /work-orders | Required | List work orders (paginated) |
| GET | /work-orders/:id | Required | Get work order details |
| PATCH | /work-orders/:id | Required | Update work order |
| DELETE | /work-orders/:id | Required | Delete work order |
| PATCH | /work-orders/:id/status | Required | Update status |

## Technician Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /technicians | Required | Create technician |
| GET | /technicians | Required | List technicians (paginated) |
| GET | /technicians/available | Required | List available technicians |
| GET | /technicians/:id | Required | Get technician details |
| PATCH | /technicians/:id | Required | Update technician |
| DELETE | /technicians/:id | Required | Delete technician |

## Customer Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /customers | Required | Create customer |
| GET | /customers | Required | List customers (paginated) |
| GET | /customers/:id | Required | Get customer details |
| PATCH | /customers/:id | Required | Update customer |
| DELETE | /customers/:id | Required | Delete customer |

## Route Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /routes | Required | Create route |
| GET | /routes | Required | List routes (paginated) |
| GET | /routes/:id | Required | Get route details |
| DELETE | /routes/:id | Required | Delete route |

## Invoice Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /invoices | Required | Create invoice |
| GET | /invoices | Required | List invoices (paginated) |
| GET | /invoices/:id | Required | Get invoice details |
| PATCH | /invoices/:id/send | Required | Send invoice |
| PATCH | /invoices/:id/pay | Required | Mark as paid |
| PATCH | /invoices/:id/void | Required | Void invoice |
| DELETE | /invoices/:id | Required | Delete draft invoice |

## Notification Endpoints

<!-- VERIFY:FD-NOTIF-001 — NotificationService provides paginated list and mark-as-read -->

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /notifications | Required | List user notifications |
| PATCH | /notifications/:id/read | Required | Mark as read |

## Audit Log Endpoints

<!-- VERIFY:FD-AUDIT-001 — AuditLogService provides paginated list and $executeRaw purge -->
<!-- VERIFY:FD-AUDIT-002 — AuditLogController exposes GET /audit-log with Cache-Control -->

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /audit-log | Required | List audit logs (paginated) |

## Pagination

All list endpoints support pagination query parameters:
- `page` (default: 1)
- `pageSize` (default: 20, max: 100, clamped not rejected)

## Response Headers

- `X-Response-Time` on all responses
- `Cache-Control: private, max-age=30` on list endpoints
