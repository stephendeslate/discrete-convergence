# Cross-Layer Integration Specification

## Overview

Cross-layer tests validate that the authentication, domain, monitoring,
and frontend layers work together correctly in an integrated system.
These tests exercise the full request lifecycle from HTTP request through
guards, controllers, services, and database operations.

## Requirements

### CROSS-001: Cross-Layer Integration Tests

- VERIFY: EM-CROSS-001 — Cross-layer integration test suite validates:
  1. Authentication flow feeds into domain CRUD operations
  2. Correlation IDs propagate through the full request pipeline
  3. Response time headers appear on all responses
  4. Health endpoint returns valid status in integrated context
  5. Metrics endpoint returns system data after request processing
  6. Auth token from login is usable for subsequent domain requests
  7. Tenant scoping is enforced across domain operations
  8. Error responses include correlation IDs for traceability

## Functional Integration

### FI-001: Login Server Action

- VERIFY: EM-FI-001 — loginAction sends POST to API_ROUTES.AUTH.LOGIN
  and stores the returned JWT in a cookies().set() call for subsequent
  authenticated requests from the frontend.

### FI-002: Register Server Action

- VERIFY: EM-FI-002 — registerAction sends POST to API_ROUTES.AUTH.REGISTER
  with name, email, password, role, and tenantId fields extracted from
  FormData.

### FI-003: Fetch Events Server Action

- VERIFY: EM-FI-003 — fetchEventsAction sends GET to API_ROUTES.EVENTS
  with Authorization: Bearer <token> header read from cookies().get().

### FI-004: Create Event Server Action

- VERIFY: EM-FI-004 — createEventAction sends POST to API_ROUTES.EVENTS
  with Authorization: Bearer header and JSON-serialized event data.

## Integration Patterns

- Frontend server actions use API_ROUTES constants from the shared package
  to ensure route consistency between frontend and backend.
- All protected server actions read the JWT from httpOnly cookies and
  include it as an Authorization Bearer header.
- Error handling in server actions propagates API error messages to the
  frontend for user display.
- Cross-layer tests use supertest for HTTP-level integration testing
  with a real NestJS application instance.

## Test Strategy

- Tests authenticate first, then perform domain operations.
- Each test validates both the happy path and error conditions.
- Correlation IDs are verified to be unique per request.
- Response time headers are verified to be numeric and positive.
- Tests run against an in-memory or test database instance.
