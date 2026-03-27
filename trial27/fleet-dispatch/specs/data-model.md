# Data Model Specification

## Overview
Prisma 6 schema with 7 models, 5 enums, snake_case mapping, composite indexes, and RLS.

### VERIFY: FD-DM-001 — All models use @@map for snake_case table names
Every model has `@@map("table_name")` and every field has `@map("column_name")` for snake_case in the database.
Example: `model Vehicle { ... @@map("vehicles") }` and `tenantId String @map("tenant_id")`.
This convention allows TypeScript code to use camelCase while PostgreSQL tables follow snake_case conventions.
The Prisma client handles the mapping transparently during query generation.

### VERIFY: FD-DM-002 — Tenant model with tier enum
Tenant has id, name, slug (unique), tier (TenantTier: FREE/PRO/ENTERPRISE), createdAt, updatedAt.
The `slug` field is unique across all tenants and used for URL-based tenant identification.
The `tier` enum controls feature access levels and billing plans.
Default tier is FREE unless explicitly set during tenant creation.

### VERIFY: FD-DM-003 — User model with tenant relation
User has id, email, passwordHash, tenantId (FK to Tenant), role, createdAt, updatedAt. Unique constraint on (tenantId, email).
The composite unique constraint allows the same email to exist under different tenants.
The `passwordHash` field stores the bcryptjs hash (see [authentication.md](authentication.md) for details).
Cascade delete: removing a tenant removes all associated users.
The `role` field determines authorization level within the tenant.

### VERIFY: FD-DM-004 — Vehicle model with type and status enums
Vehicle has id, tenantId, name, licensePlate, type (VehicleType), status (VehicleStatus), mileage, timestamps. Unique on (tenantId, licensePlate).
VehicleType enum: SEDAN, SUV, VAN, TRUCK, BUS.
VehicleStatus enum: AVAILABLE, IN_USE, MAINTENANCE, RETIRED.
The `mileage` field tracks total kilometers driven and is updated after dispatch job completion.
Edge case: Vehicles in MAINTENANCE or RETIRED status cannot be assigned to dispatch jobs.

### VERIFY: FD-DM-005 — Driver model with status enum
Driver has id, tenantId, name, email, licenseNumber, status (DriverStatus), timestamps. Unique on (tenantId, email) and (tenantId, licenseNumber).
DriverStatus enum: AVAILABLE, ON_DUTY, OFF_DUTY, SUSPENDED.
Two unique constraints prevent duplicate emails and license numbers within the same tenant.
Edge case: Only drivers with AVAILABLE status can be assigned to new dispatch jobs.

### VERIFY: FD-DM-006 — DispatchJob model with status transitions
DispatchJob has id, tenantId, vehicleId (nullable FK), driverId (nullable FK), origin, destination, status (JobStatus), scheduledAt, completedAt, timestamps.
JobStatus enum: PENDING, IN_PROGRESS, COMPLETED, CANCELLED.
Valid transitions: PENDING → IN_PROGRESS (via assign), IN_PROGRESS → COMPLETED, any → CANCELLED.
The `vehicleId` and `driverId` are nullable because jobs start unassigned in PENDING status.
The `completedAt` timestamp is set automatically when transitioning to COMPLETED.

### VERIFY: FD-DM-007 — All foreign keys have @@index
Every foreign key field (tenantId, vehicleId, driverId, userId) has an explicit @@index. Composite indexes on (tenantId, status) exist for Vehicle, Driver, and DispatchJob.
These indexes optimize tenant-scoped queries and status-based filtering.
The composite indexes support the common query pattern of "list all vehicles/drivers/jobs for tenant X with status Y".
Foreign key indexes also improve JOIN performance for dispatch job queries that include vehicle and driver data.

### VERIFY: FD-DM-008 — MaintenanceLog and AuditLog models
MaintenanceLog tracks vehicle maintenance with type, description, cost, performedAt. AuditLog tracks tenant actions with action, entity, entityId, userId, metadata.
MaintenanceLog has a FK to Vehicle and is tenant-scoped via the vehicle's tenantId.
AuditLog entries are immutable and ordered by createdAt descending for the audit trail.
The metadata field is a JSON column for storing contextual details about each audited action.
