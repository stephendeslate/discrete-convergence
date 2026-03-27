# Edge Cases Specification

## Overview
Error handling, validation edge cases, boundary conditions, and failure modes.

### VERIFY: EM-EDGE-001 — Malformed request body returns 400 (malformed)
ValidationPipe rejects requests with invalid or malformed input. Returns 400 with validation error details.

### VERIFY: EM-EDGE-002 — Missing required fields returns 400 (empty)
Requests missing required fields (e.g., empty email, missing password) return 400 Bad Request.

### VERIFY: EM-EDGE-003 — Invalid credentials returns 401 (unauthorized)
Login with wrong email or password returns 401 Unauthorized with generic "Invalid credentials" message.

### VERIFY: EM-EDGE-004 — Resource not found returns 404 (not found)
Requesting a non-existent event, venue, or other resource returns 404 Not Found.

### VERIFY: EM-EDGE-005 — Duplicate email registration returns 409 (duplicate, conflict)
Attempting to register with an email that already exists in the same tenant returns 409 Conflict.

### VERIFY: EM-EDGE-006 — Access without token returns 401 (unauthorized)
Protected endpoints without a valid JWT Bearer token return 401 Unauthorized.

### VERIFY: EM-EDGE-007 — Invalid event status transition returns 400 (invalid, boundary)
Publishing a non-DRAFT event or cancelling an already CANCELLED/COMPLETED event returns 400 Bad Request.

### VERIFY: EM-EDGE-008 — End date before start date returns 400 (invalid, boundary)
Creating or updating an event where endDate <= startDate returns 400 Bad Request.

### VERIFY: EM-EDGE-009 — Deleting non-DRAFT event returns 400 (forbidden, boundary)
Only DRAFT events can be deleted. Attempting to delete a PUBLISHED or CANCELLED event returns 400.

### VERIFY: EM-EDGE-010 — Pagination with invalid values uses defaults (boundary)
Non-numeric or negative page/pageSize values are clamped to valid defaults (page=1, pageSize=10, max=100).

### VERIFY: EM-EDGE-011 — Page size exceeds MAX_PAGE_SIZE is clamped (boundary)
Page size values above MAX_PAGE_SIZE (100) are clamped to 100.

### VERIFY: EM-EDGE-012 — Zero or negative venue capacity returns 400 (invalid, boundary)
Creating a venue with capacity <= 0 returns 400 Bad Request.

### VERIFY: EM-EDGE-013 — Negative ticket price returns 400 (invalid)
Creating a ticket type with negative price returns 400 Bad Request.

### VERIFY: EM-EDGE-014 — Sold out ticket returns 400 (boundary, error)
Registering for a ticket type where sold >= quantity returns 400 "sold out".

### VERIFY: EM-EDGE-015 — Registration for non-PUBLISHED event returns 400 (forbidden)
Can only register for events with PUBLISHED status. Other statuses return 400.

### VERIFY: EM-EDGE-016 — Non-whitelisted DTO fields are rejected (malformed)
Fields not defined in DTOs are rejected due to `forbidNonWhitelisted: true` in ValidationPipe.

### VERIFY: EM-EDGE-017 — Exception filter prevents stack trace leakage (error)
Internal server errors return generic message without stack traces or internal details.
