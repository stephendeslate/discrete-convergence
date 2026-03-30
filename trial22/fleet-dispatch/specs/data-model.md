# Data Model Specification

## Overview

Fleet Dispatch uses a PostgreSQL database with 14 domain entities, managed via
Prisma 6 ORM. All tenant-scoped tables include a tenant_id foreign key and
Row Level Security (RLS) policies.

## Entities

### Tenant
Root entity for multi-tenancy. Fields: id, name, slug (unique), timestamps.
<!-- VERIFY: FD-DATA-001 — Tenant slug is unique with VARCHAR(100) -->

### User
Authenticated users. Fields: id, email (unique), password, name, role (enum), tenant_id, timestamps.
<!-- VERIFY: FD-DATA-002 — User email has unique index and VARCHAR(255) -->

### Vehicle
Fleet vehicles. Fields: id, vin (VARCHAR 17), license_plate, make, model, year, status (enum), mileage, tenant_id.
Indexes on tenant_id, status, and composite (tenant_id, status).
<!-- VERIFY: FD-DATA-003 — Vehicle has composite index on tenant_id + status -->

### Driver
Fleet drivers. Fields: id, name, license_number, phone, status (enum), tenant_id.
<!-- VERIFY: FD-DATA-004 — Driver has composite index on tenant_id + status -->

### Route
Route definitions. Fields: id, name, description (nullable), status, distance (Decimal 10,2), tenant_id.

### Trip
Trips linking route, vehicle, and driver. Fields: id, route_id, vehicle_id, driver_id, status, start_time, end_time, tenant_id.

### Stop
Route waypoints. Fields: id, route_id, name, address, latitude/longitude (Decimal 10,7), sequence, tenant_id.

### Dispatch
Delivery dispatch. Fields: id, trip_id, status, notes, priority, tenant_id.

### MaintenanceRecord
Vehicle maintenance. Fields: id, vehicle_id, description, cost (Decimal 12,2), performed_at, tenant_id.

### FuelLog
Fuel consumption. Fields: id, vehicle_id, gallons, cost_per_unit, total_cost, mileage, filled_at, tenant_id.

### Geofence
Geographic boundaries. Fields: id, name, latitude, longitude, radius (Decimal 10,2), tenant_id.

### Alert
System alerts. Fields: id, message, severity (enum), read, tenant_id.

### Notification
User notifications. Fields: id, user_id, title, body, read, tenant_id.

### AuditLog
Audit trail. Fields: id, user_id, action, entity, entity_id, details, tenant_id, created_at.
<!-- VERIFY: FD-DATA-005 — AuditLog has composite index on tenant_id + entity -->

## Enums (7)
UserRole, VehicleStatus, DriverStatus, RouteStatus, TripStatus, DispatchStatus, AlertSeverity

## Row Level Security

<!-- VERIFY: FD-DATA-006 — All 14 tables have ENABLE ROW LEVEL SECURITY -->
<!-- VERIFY: FD-DATA-007 — All tenant-scoped tables have FORCE ROW LEVEL SECURITY -->
<!-- VERIFY: FD-DATA-008 — RLS policies use current_setting('app.tenant_id', true) -->

All tables use RLS policies checking tenant_id against app.tenant_id session variable,
set via PrismaService.setTenantContext using $executeRaw with parameterized SQL.
