# Dispatches Specification

## Overview

Dispatches represent the assignment of a vehicle and driver to a route. They follow
a state machine pattern with strict transition rules and cascading effects on
vehicle and driver statuses.

## Data Model

### Fields
- id: UUID primary key
- vehicleId: UUID, required, foreign key to Vehicle
- driverId: UUID, required, foreign key to Driver
- routeId: UUID, required, foreign key to Route
- status: DispatchStatus enum (PENDING, ASSIGNED, IN_TRANSIT, COMPLETED, CANCELLED)
- scheduledAt: timestamp, required
- startedAt: timestamp, nullable (set on assign)
- completedAt: timestamp, nullable (set on complete)
- tenantId: UUID, required
- createdAt: timestamp, auto-generated
- updatedAt: timestamp, auto-updated

### Indexes
- @@index([tenantId])
- @@index([status])
- @@index([vehicleId])
- @@index([driverId])

## State Machine

Valid transitions:
- PENDING -> ASSIGNED (via assign endpoint)
- ASSIGNED -> IN_TRANSIT (via trip creation)
- ASSIGNED -> COMPLETED (via complete endpoint)
- IN_TRANSIT -> COMPLETED (via complete endpoint)
- PENDING -> CANCELLED (via cancel endpoint)
- ASSIGNED -> CANCELLED (via cancel endpoint)
- IN_TRANSIT -> CANCELLED (via cancel endpoint)

Invalid transitions (rejected):
- COMPLETED -> any state
- CANCELLED -> any state
- PENDING -> COMPLETED (must be assigned first)

## Endpoints

### POST /dispatches
- Validates vehicle exists and is ACTIVE
- Validates vehicle has no active dispatches (ASSIGNED/IN_TRANSIT)
- Validates driver exists and is AVAILABLE
- Validates route exists
- Creates dispatch in PENDING status
- Creates audit log entry

### PATCH /dispatches/:id/assign
- Validates current status is PENDING
- Sets driver to ON_DUTY
- Transitions dispatch to ASSIGNED
- Sets startedAt timestamp
- Creates audit log entry

### PATCH /dispatches/:id/complete
- Rejects if already COMPLETED
- Rejects if CANCELLED
- Rejects if PENDING (not yet assigned)
- Sets driver to AVAILABLE
- Transitions to COMPLETED
- Sets completedAt timestamp
- Creates audit log entry

### PATCH /dispatches/:id/cancel
- Rejects if already CANCELLED
- Rejects if COMPLETED
- If ASSIGNED or IN_TRANSIT, frees driver (sets to AVAILABLE)
- Transitions to CANCELLED
- Creates audit log entry

## Business Rules

1. Only one active dispatch per vehicle at a time
2. Only AVAILABLE drivers can be assigned
3. Completing a dispatch frees the driver
4. Cancelling a dispatch frees the driver if assigned
5. All state changes are audited

## Cross-References

- See [Vehicles](vehicles.md) for vehicle status management and deactivation guards
- See [Drivers](drivers.md) for driver availability and status transitions
- See [Routes](routes.md) for route data referenced by dispatches
- See [Trips](trips.md) for trip creation tied to dispatch status
