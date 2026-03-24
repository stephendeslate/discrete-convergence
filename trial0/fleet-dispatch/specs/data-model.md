# Data Model Specification

## Overview

FleetDispatch uses Prisma 6 with PostgreSQL 16. The schema defines 14 models
and 8 enums with full @@map, @map, and @@index annotations.

## Models

### Company
- VERIFY:FD-SCHEMA-001 — Company model with id, name, timestamps
- @@map("companies")

### User
- VERIFY:FD-SCHEMA-002 — User model with id, email (unique per company), passwordHash, name, role, companyId
- @@map("users"), @@index([companyId])

### Technician
- VERIFY:FD-SCHEMA-003 — Technician model linked to User, with specialties, currentLat, currentLng, lastGpsAt
- @@map("technicians"), @@index([companyId])

### Customer
- VERIFY:FD-SCHEMA-004 — Customer model with name, email, phone, address fields, companyId
- @@map("customers"), @@index([companyId])

### WorkOrder
- VERIFY:FD-SCHEMA-005 — WorkOrder with title, description, status (9-state), priority, scheduledDate
- Links to customer, technician, company
- @@map("work_orders"), @@index([companyId, status])

### WorkOrderStatusHistory
- VERIFY:FD-SCHEMA-006 — Tracks all status transitions with fromStatus, toStatus, changedBy, timestamp
- @@map("work_order_status_history")

### Route
- VERIFY:FD-SCHEMA-007 — Route model with technicianId, date, optimizedOrder
- @@map("routes"), @@index([companyId])

### RouteStop
- VERIFY:FD-SCHEMA-008 — RouteStop with routeId, workOrderId, sequence, estimatedArrival
- @@map("route_stops")

### GpsLog
- VERIFY:FD-SCHEMA-009 — GPS position log with technicianId, lat, lng, accuracy, timestamp
- @@map("gps_logs"), @@index([technicianId])

### JobPhoto
- VERIFY:FD-SCHEMA-010 — Photo attached to work order with url, caption, type (BEFORE/AFTER)
- @@map("job_photos")

### Invoice
- VERIFY:FD-SCHEMA-011 — Invoice with sequenceNumber, workOrderId, status (DRAFT/SENT/PAID/VOID)
- Decimal fields: subtotal, tax, total
- @@map("invoices"), @@index([companyId])

### LineItem
- VERIFY:FD-SCHEMA-012 — LineItem with invoiceId, description, quantity, unitPrice, total, type
- @@map("line_items")

### Notification
- VERIFY:FD-SCHEMA-013 — Notification with userId, type, channel, status, title, body
- @@map("notifications"), @@index([companyId])

### AuditLog
- VERIFY:FD-SCHEMA-014 — AuditLog with userId, action, entity, entityId, metadata (JSON)
- @@map("audit_logs"), @@index([companyId])

## Enums

All enums use @map for snake_case database values:
- UserRole: ADMIN, DISPATCHER, TECHNICIAN, CUSTOMER
- WorkOrderStatus: 9 states (UNASSIGNED through PAID, plus CANCELLED)
- Priority: LOW, MEDIUM, HIGH, URGENT
- InvoiceStatus: DRAFT, SENT, PAID, VOID
- LineItemType: LABOR, MATERIAL, TRAVEL, OTHER
- NotificationType: ASSIGNMENT, STATUS_CHANGE, INVOICE, SYSTEM
- NotificationChannel: EMAIL, SMS, PUSH, IN_APP
- NotificationStatus: PENDING, SENT, FAILED, READ

## Migrations

- VERIFY:FD-MIG-001 — Migration includes RLS policies on tenant-scoped tables
- RLS enabled on: users, work_orders, technicians, customers, routes, invoices, audit_logs

## Seed Data

- VERIFY:FD-SEED-001 — Seed creates company, users (4 roles), technicians, customers, work orders
- VERIFY:FD-SEED-002 — Seed has try/catch with process.exit(1) on error
- VERIFY:FD-RAW-001 — Zero $executeRawUnsafe calls in codebase

## Cross-References

- See [Authentication](./authentication.md) for User/Company auth flows
- See [API Endpoints](./api-endpoints.md) for CRUD operations on each model
- See [Security](./security.md) for RLS policy details
