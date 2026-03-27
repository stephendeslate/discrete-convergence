# Edge Cases Specification

## Overview
Boundary conditions, error scenarios, and validation edge cases across all modules.

### VERIFY: FD-EDGE-001 — Invalid credentials return unauthorized
POST /auth/login with non-existent email or wrong password returns 401 Unauthorized with generic "Invalid credentials" message.

### VERIFY: FD-EDGE-002 — Malformed JWT returns unauthorized
Requests with invalid, expired, or malformed JWT tokens receive 401 Unauthorized.

### VERIFY: FD-EDGE-003 — Empty request body returns bad request error
POST endpoints with empty or missing body fields return 400 with validation error details.

### VERIFY: FD-EDGE-004 — Vehicle not found returns 404 error
GET /vehicles/:id with non-existent ID returns 404 Not Found.

### VERIFY: FD-EDGE-005 — Driver not found returns 404 error
GET /drivers/:id with non-existent ID returns 404 Not Found.

### VERIFY: FD-EDGE-006 — Invalid vehicle reference in job returns not found
Creating a dispatch job with a vehicleId that doesn't exist in the tenant returns 404.

### VERIFY: FD-EDGE-007 — Invalid driver reference in job returns not found
Creating a dispatch job with a driverId that doesn't exist in the tenant returns 404.

### VERIFY: FD-EDGE-008 — Dispatch job not found returns 404 error
GET /dispatch-jobs/:id with non-existent ID returns 404 Not Found.

### VERIFY: FD-EDGE-009 — Cannot update completed or cancelled job error
PATCH on a COMPLETED or CANCELLED dispatch job returns 400 Bad Request.

### VERIFY: FD-EDGE-010 — Cannot assign to completed or cancelled job error
POST /dispatch-jobs/:id/assign on a COMPLETED or CANCELLED job returns 400 Bad Request.

### VERIFY: FD-EDGE-011 — Can only complete in-progress jobs boundary
POST /dispatch-jobs/:id/complete on a PENDING or CANCELLED job returns 400 Bad Request.

### VERIFY: FD-EDGE-012 — Duplicate email registration returns conflict
POST /auth/register with an already-registered email returns 409 Conflict.

### VERIFY: FD-EDGE-013 — Duplicate license plate returns conflict
Creating or updating a vehicle with a license plate that already exists in the tenant returns 409 Conflict.

### VERIFY: FD-EDGE-014 — Duplicate driver email returns conflict
Creating a driver with an email that already exists in the tenant returns 409 Conflict.

### VERIFY: FD-EDGE-015 — Duplicate driver license number returns conflict
Creating a driver with a license number that already exists in the tenant returns 409 Conflict.

### VERIFY: FD-EDGE-016 — Cannot cancel completed job error
POST /dispatch-jobs/:id/cancel on a COMPLETED job returns 400 Bad Request.

### VERIFY: FD-EDGE-017 — Cannot cancel already cancelled job error
POST /dispatch-jobs/:id/cancel on a CANCELLED job returns 400 "Job is already cancelled".

### VERIFY: FD-EDGE-018 — Maintenance for non-existent vehicle returns not found
GET or POST maintenance for a vehicleId that doesn't exist in the tenant returns 404.

### VERIFY: FD-EDGE-019 — Forbidden access to other tenant data
Tenant-scoped queries ensure users can only access their own tenant's data. RLS provides database-level enforcement.
