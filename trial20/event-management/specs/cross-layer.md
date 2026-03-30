# Cross-Layer Integration Specification

## Overview

This document specifies how layers interact across the Event Management
Platform stack. Cross-layer concerns include shared package integration,
auth-to-CRUD pipelines, correlation ID propagation, tenant isolation
across layers, and frontend-to-backend communication.

## Shared Package Integration

VERIFY: EM-CROSS-003 — AppModule imports all feature modules and configures global providers

The shared package (@event-management/shared) is consumed by both the API
and web apps. It provides:
- Constants: BCRYPT_SALT_ROUNDS, ALLOWED_REGISTRATION_ROLES, MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE, APP_VERSION
- Utilities: createCorrelationId, formatLogEntry, sanitizeLogContext, validateEnvVars
- Pagination: clampPagination, buildPaginatedResult

The shared package MUST compile to dist/ before apps can build.
Turbo's ^build dependency ensures correct build ordering.

See: infrastructure.md for build pipeline
See: data-model.md for constant usage in seed

## Auth-to-CRUD Pipeline

VERIFY: EM-CROSS-001 — Dashboard controller extracts tenantId from req.user

The full request pipeline flows:
1. Client sends request with Bearer token
2. CorrelationIdMiddleware assigns/preserves correlation ID
3. RequestLoggingMiddleware logs incoming request
4. JwtAuthGuard validates token and populates req.user
5. RolesGuard checks role authorization
6. Controller extracts tenantId from req.user
7. Service executes tenant-scoped database query
8. ResponseTimeInterceptor measures and attaches timing
9. Response includes correlation ID, cache-control, timing headers

Integration tests verify this full pipeline end-to-end.

See: authentication.md for JWT validation
See: security.md for RBAC enforcement

## Correlation ID Through Error Paths

VERIFY: EM-CROSS-002 — Data source controller extracts tenantId from req.user

When an error occurs:
1. GlobalExceptionFilter catches the exception
2. Extracts correlationId from the request
3. Logs the error with Pino (sanitized context)
4. Returns error response with correlationId field
5. X-Correlation-ID header is still set by middleware

This ensures errors are traceable through the full system.

See: monitoring.md for correlation ID middleware
See: security.md for exception filter

## Tenant Isolation Verification

Every controller that handles tenant-scoped data:
1. Extracts tenantId from req.user (JWT payload)
2. Passes tenantId to the service layer
3. Service includes tenantId in all Prisma queries
4. Database RLS provides additional isolation layer

Controllers verified for tenant extraction:
- EventController
- VenueController
- AttendeeController
- RegistrationController
- DashboardController
- DataSourceController

See: data-model.md for RLS policies
See: api-endpoints.md for endpoint authorization

## Frontend-to-Backend Communication

The Next.js frontend communicates with the API exclusively through
server actions. This provides:
- httpOnly cookie storage (prevents XSS token theft)
- Server-side token management
- Automatic header injection (Authorization Bearer)
- Type-safe error handling

See: frontend.md for server action implementation
See: authentication.md for token lifecycle

## Integration Test Coverage

Cross-layer integration tests verify:
1. Health check returns APP_VERSION from shared
2. Full pipeline: auth -> CRUD -> error handling -> correlation ID -> timing
3. Correlation ID propagation through the full chain
4. DB connectivity through health/ready
5. RBAC enforcement (viewer blocked from admin operations)
6. Error paths include correlationId in response body

See: edge-cases.md for error path testing
See: performance.md for timing assertions
