# API Endpoints Specification

## Overview
REST API with tenant-scoped CRUD, pagination, validation, and state transitions.

### VERIFY: FD-API-001 — Pagination on all list endpoints
All GET list endpoints accept page and pageSize query parameters. Results are clamped to MAX_PAGE_SIZE (100) and default to DEFAULT_PAGE_SIZE (10). Response includes meta with page, pageSize, total, totalPages.
The pagination utility validates that page >= 1 and pageSize >= 1.
If pageSize exceeds MAX_PAGE_SIZE, it is silently clamped to 100.
The meta object enables clients to implement page navigation without additional requests.
Edge case: Requesting a page beyond the last page returns an empty data array with correct meta.

### VERIFY: FD-API-002 — Vehicle CRUD at /vehicles
POST /vehicles creates a vehicle. GET /vehicles lists with pagination. GET /vehicles/:id returns one. PATCH /vehicles/:id updates. DELETE /vehicles/:id removes. All require JWT auth.
POST validation: name and licensePlate are required. licensePlate must be unique within the tenant.
GET list supports filtering by status via query parameter.
PATCH allows partial updates — only provided fields are modified.
DELETE returns 404 if the vehicle does not exist or belongs to a different tenant.
Edge case: Deleting a vehicle with active dispatch jobs returns 400 Bad Request.

### VERIFY: FD-API-003 — Driver CRUD at /drivers
POST /drivers creates a driver. GET /drivers lists with pagination. GET /drivers/:id returns one. PATCH /drivers/:id updates. DELETE /drivers/:id removes. All require JWT auth.
POST validation: name, email, and licenseNumber are required. Both must be unique within the tenant.
GET list supports filtering by status query parameter.
Error: Returns 409 Conflict if email or licenseNumber already exists for the tenant.

### VERIFY: FD-API-004 — Dispatch job CRUD at /dispatch-jobs
POST /dispatch-jobs creates a job. GET /dispatch-jobs lists with pagination (includes vehicle and driver). GET /dispatch-jobs/:id returns one. PATCH /dispatch-jobs/:id updates. DELETE /dispatch-jobs/:id removes.
POST validation: origin and destination are required string fields.
GET list includes related vehicle and driver data via Prisma include.
New jobs are created with PENDING status and null vehicleId/driverId.

### VERIFY: FD-API-005 — Assign vehicle and driver to dispatch job
POST /dispatch-jobs/:id/assign accepts vehicleId and driverId. Validates both belong to the tenant. Sets status to IN_PROGRESS.
Both vehicle and driver must be in AVAILABLE status at the time of assignment.
The endpoint updates the job atomically: sets vehicleId, driverId, and status in one transaction.
Error: Returns 400 if the job is not in PENDING status.
Error: Returns 404 if the vehicle or driver does not exist or belongs to a different tenant.

### VERIFY: FD-API-006 — Complete a dispatch job
POST /dispatch-jobs/:id/complete transitions status from IN_PROGRESS to COMPLETED and sets completedAt.
Error: Returns 400 if the job is not in IN_PROGRESS status.
The completedAt timestamp is set to the current date/time automatically.

### VERIFY: FD-API-007 — Cancel a dispatch job
POST /dispatch-jobs/:id/cancel transitions status to CANCELLED. Cannot cancel completed or already cancelled jobs.
Valid source statuses: PENDING, IN_PROGRESS. These can be cancelled.
Error: Returns 400 if the job is already COMPLETED or CANCELLED.

### VERIFY: FD-API-008 — Maintenance logs at /vehicles/:vehicleId/maintenance
GET /vehicles/:vehicleId/maintenance lists logs with pagination. POST creates a new maintenance log. Both validate the vehicle belongs to the tenant.
POST body: type, description, cost, performedAt.
Maintenance log types include: OIL_CHANGE, TIRE_ROTATION, BRAKE_SERVICE, GENERAL_INSPECTION.
Error: Returns 404 if the vehicleId does not exist or belongs to a different tenant.

### VERIFY: FD-API-009 — Audit log at /audit-log
GET /audit-log lists tenant-scoped audit entries with pagination. The audit log service provides a log() method for recording actions.
Entries are sorted by createdAt descending (newest first).
The log() method is called by services after successful create, update, and delete operations.
Each entry records: action (CREATE/UPDATE/DELETE), entity name, entityId, userId, and metadata JSON.
