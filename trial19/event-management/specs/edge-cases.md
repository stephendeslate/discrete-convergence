# Edge Cases

## Authentication Edge Cases

- VERIFY: EC-AUTH-001 — Registration with duplicate email returns 409 Conflict
- VERIFY: EC-AUTH-002 — Login with non-existent email returns 401 Unauthorized
- VERIFY: EC-AUTH-003 — Login with wrong password returns 401 Unauthorized
- VERIFY: EC-AUTH-004 — Registration with ADMIN role is rejected by DTO validation
- VERIFY: EC-AUTH-005 — Expired JWT returns 401 on protected routes
- VERIFY: EC-AUTH-006 — Malformed JWT returns 401 on protected routes

## Validation Edge Cases

- VERIFY: EC-VAL-001 — Extra properties in request body are rejected (forbidNonWhitelisted)
- VERIFY: EC-VAL-002 — Missing required fields return 400 Bad Request
- VERIFY: EC-VAL-003 — Invalid email format returns 400 Bad Request
- VERIFY: EC-VAL-004 — SQL injection attempts in query parameters are parameterized

## Pagination Edge Cases

- VERIFY: EC-PAGE-001 — Page size exceeding MAX_PAGE_SIZE is clamped to 100
- VERIFY: EC-PAGE-002 — Negative page numbers default to page 1
- VERIFY: EC-PAGE-003 — Zero limit defaults to DEFAULT_PAGE_SIZE

## Resource Edge Cases

- VERIFY: EC-RES-001 — GET /events/:id with non-existent ID returns 404
- VERIFY: EC-RES-002 — UPDATE /events/:id with non-existent ID returns 404
- VERIFY: EC-RES-003 — DELETE /events/:id with non-existent ID returns 404
- VERIFY: EC-RES-004 — Viewer role attempting ADMIN-only operation returns 403

## Monitoring Edge Cases

- VERIFY: EC-MON-001 — Health check returns 503 when database is disconnected
- VERIFY: EC-MON-002 — Client-provided X-Correlation-ID is preserved in response
- VERIFY: EC-MON-003 — Error responses include correlationId in body
- VERIFY: EC-MON-004 — Sensitive fields in log context are recursively redacted

## Security Edge Cases

- VERIFY: EC-SEC-001 — X-Powered-By header is absent from all responses
- VERIFY: EC-SEC-002 — XSS payload in URL path returns JSON 404 (not HTML)
- VERIFY: EC-SEC-003 — Requests without Authorization header to protected routes return 401
- VERIFY: EC-SEC-004 — Concurrent rapid requests are handled by throttle without crash
