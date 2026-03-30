# FD-SPEC-003: Data Model

## Overview
The data model is defined in Prisma schema with PostgreSQL as the backing store.
All entities follow a multi-tenant design with `tenantId` foreign keys.

## Entities

### Tenant
- id (UUID), name, tier (FREE/PRO/ENTERPRISE), settings (JSON)
- Root entity for multi-tenant isolation

### User
- id, email, passwordHash, name, role (ADMIN/DISPATCHER/DRIVER), tenantId
- Unique constraint on (email, tenantId) — same email allowed in different tenants

### Vehicle
- id, licensePlate, make, model, year, status (AVAILABLE/IN_TRANSIT/MAINTENANCE/RETIRED)
- latitude/longitude (Decimal nullable), mileage (Decimal)
- Indexed on (tenantId), (status), (tenantId, status)

### Driver
- id, name, licenseNumber, phone, available (boolean), vehicleId (nullable)
- Indexed on (tenantId), (available), (tenantId, available)

### Route
- id, name, origin, destination, waypoints (JSON array), distanceKm (Decimal), estimatedMinutes, actualMinutes
- Indexed on (tenantId)

### Delivery
- id, trackingCode, status (PENDING/ASSIGNED/IN_TRANSIT/DELIVERED/FAILED)
- recipientName, address, notes, cost (Decimal)
- Foreign keys: vehicleId, driverId, routeId, tenantId
- scheduledAt, deliveredAt timestamps
- Indexed on (tenantId), (status), (tenantId, status), (trackingCode)

### AuditLog
- id, action, entity, entityId, details (JSON), userId, tenantId, createdAt
- Read-only append log
- Indexed on (tenantId), (userId), (tenantId, entity)

## Decimal Fields
Cost, mileage, latitude, longitude, and distanceKm use Decimal(12,2) or Decimal(10,7)
to avoid floating-point precision issues.

<!-- VERIFY:FD-VEH-001 — vehicle service uses Decimal for mileage -->
<!-- VERIFY:FD-DEL-001 — delivery service uses Decimal for cost -->
<!-- VERIFY:FD-ROUTE-001 — route service uses Decimal for distanceKm -->

## Prisma Service
The PrismaService extends PrismaClient with OnModuleInit/OnModuleDestroy lifecycle hooks.

<!-- VERIFY:FD-DA-001 — Prisma service lifecycle management -->
