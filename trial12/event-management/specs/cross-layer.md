# Cross-Layer Integration Specification

## Overview

This specification covers cross-cutting concerns that span multiple layers of the Event Management stack: API-to-frontend integration, shared package consumption, accessibility, and end-to-end data flow verification.

See also: [Frontend](frontend.md), [API Endpoints](api-endpoints.md), [Infrastructure](infrastructure.md).

## Module Integration

VERIFY: EM-CROSS-001
AppModule wires all cross-cutting providers via APP_GUARD (ThrottlerGuard, JwtAuthGuard, RolesGuard), APP_FILTER (GlobalExceptionFilter), and APP_INTERCEPTOR (ResponseTimeInterceptor). Middleware chain registers CorrelationIdMiddleware and RequestLoggingMiddleware for all routes.

VERIFY: EM-CROSS-002
Cross-layer integration tests verify the full request pipeline: correlation ID is generated and returned in response headers, response time header is present, global exception filter formats errors consistently, and middleware chain executes in correct order.

## Frontend Integration

VERIFY: EM-FI-001
API_ROUTES constant in actions.ts defines all backend endpoint URLs as single-quoted strings. Routes match the API controller paths exactly (events, venues, tickets, schedules, attendees, auth/login, auth/register, monitoring/health).

VERIFY: EM-FI-002
loginAction server action authenticates via POST to auth/login, extracts JWT token from response, and stores it via cookies().set() for subsequent authenticated requests.

VERIFY: EM-FI-003
authenticatedFetch helper reads JWT token from cookies and includes it as Authorization: Bearer header in all protected API calls. Returns null on auth failure (401/403).

VERIFY: EM-FI-004
Route-matched server actions (fetchEvents, fetchVenues, fetchTickets, fetchSchedules, fetchAttendees) each call authenticatedFetch with the corresponding API_ROUTES path, maintaining route consistency between frontend and backend.

## Accessibility

VERIFY: EM-AX-001
Accessibility tests use jest-axe to verify Dashboard and Login pages produce zero axe violations. Tests import real page components — no inline fixture components.

VERIFY: EM-AX-002
Keyboard navigation tests verify Tab order through interactive elements and form submission via keyboard. Tests import real page components (LoginPage, DashboardPage) — no inline fixture components.

## Data Flow

The complete request lifecycle:
1. Client sends request to Next.js server action
2. Server action reads JWT from cookies, calls API with Bearer token
3. API CorrelationIdMiddleware generates correlation ID
4. RequestLoggingMiddleware logs the request with correlation ID
5. JwtAuthGuard validates token (or skips for @Public endpoints)
6. RolesGuard checks user role against @Roles metadata
7. Controller delegates to service layer
8. Service queries Prisma with tenant scoping (tenantId from req.user)
9. ResponseTimeInterceptor measures duration, sets X-Response-Time header
10. GlobalExceptionFilter catches errors, sanitizes context, returns structured response
11. Correlation ID returned in X-Correlation-Id response header

## Shared Package Consumption

Both API and web apps import from `@event-management/shared`:
- API uses: APP_VERSION, BCRYPT_SALT_ROUNDS, ALLOWED_REGISTRATION_ROLES, SENSITIVE_KEYS, createCorrelationId, formatLogEntry, sanitizeLogContext, validateEnvVars, clampPageSize, calculateSkip
- Web uses: APP_VERSION (if needed for display)
- Shared package is built first in Turborepo pipeline via `^build` dependency
