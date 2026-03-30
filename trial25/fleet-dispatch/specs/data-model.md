# Data Model Specification

## Overview

The data model uses Prisma 6 ORM with PostgreSQL 16. All entities follow consistent
conventions for naming, indexing, and multi-tenant isolation via Row-Level Security.

## Entities

### User
- Fields: id, email, passwordHash, role (UserRole enum), tenantId, createdAt, updatedAt
- Table name: users (@@map)
- Unique constraint on email
- Index on tenantId

### Vehicle
- Fields: id, name, plateNumber, type (VehicleType enum), capacity, status (VehicleStatus enum), tenantId, createdAt, updatedAt
- Table name: vehicles (@@map)
- Index on tenantId, status
- Status: ACTIVE, INACTIVE, MAINTENANCE

### Driver
- Fields: id, name, email, phone, licenseNumber, status (DriverStatus enum), tenantId, createdAt, updatedAt
- Table name: drivers (@@map)
- Index on tenantId, status
- Status: AVAILABLE, ON_DUTY, OFF_DUTY

### Route
- Fields: id, name, description, startPoint, endPoint, distance, estimatedDuration, tenantId, createdAt, updatedAt
- Table name: routes (@@map)
- Index on tenantId

### Dispatch
- Fields: id, vehicleId, driverId, routeId, status (DispatchStatus enum), scheduledAt, startedAt, completedAt, tenantId, createdAt, updatedAt
- Table name: dispatches (@@map)
- Index on tenantId, status, vehicleId, driverId
- Status: PENDING, ASSIGNED, IN_TRANSIT, COMPLETED, CANCELLED
- Relations: belongs to Vehicle, Driver, Route

### Maintenance
- Fields: id, vehicleId, type (MaintenanceType enum), description, scheduledDate, completedDate, cost, status, tenantId, createdAt, updatedAt
- Table name: maintenance_records (@@map)
- Index on tenantId, vehicleId
- Type: SCHEDULED, EMERGENCY, PREVENTIVE

### Trip
- Fields: id, dispatchId, startLocation, endLocation, startTime, endTime, distance, status, tenantId, createdAt, updatedAt
- Table name: trips (@@map)
- Index on tenantId, dispatchId
- Relation: belongs to Dispatch

### Zone
- Fields: id, name, description, boundaries (Json), tenantId, createdAt, updatedAt
- Table name: zones (@@map)
- Index on tenantId

### AuditLog
- Fields: id, action, entity, entityId, userId, tenantId, details (Json), createdAt
- Table name: audit_logs (@@map)
- Index on tenantId, userId, entity

## Conventions

- All models use @@map for snake_case table names
- All enum values use @map for snake_case storage values
- All FK fields and tenantId have @@index for query performance
- UUID primary keys with @default(uuid())
- Timestamps: createdAt with @default(now()), updatedAt with @updatedAt

## Row-Level Security

- All tenanted tables have ENABLE ROW LEVEL SECURITY
- All tenanted tables have FORCE ROW LEVEL SECURITY
- SELECT/INSERT/UPDATE/DELETE policies use current_setting('app.tenant_id', true)
- PrismaService.setTenantContext() sets app.tenant_id via $executeRaw
- Migration SQL includes CREATE POLICY statements for all tenanted tables
