# API Endpoints Specification

## Overview
NestJS 11 REST API with global guards, filters, interceptors registered via DI.
All endpoints tenant-scoped except public discovery and auth routes.

## Bootstrap
- VERIFY:EM-MAIN-001 — main.ts uses app.enableCors(), helmet(), ValidationPipe(whitelist+transform)
- VERIFY:EM-APP-001 — AppModule registers all providers via APP_GUARD, APP_FILTER, APP_INTERCEPTOR

## Auth Routes (Public)
- POST /auth/register — Create account with role validation
- POST /auth/login — Authenticate and receive JWT
- POST /auth/refresh — Refresh JWT token
- Cross-reference: [authentication.md](./authentication.md) — Guard bypass with @Public()

## Event Routes
- VERIFY:EM-EVENT-001 — EventService.create generates slug from title
- VERIFY:EM-EVENT-002 — EventService.findAll with pagination clamping via MAX_PAGE_SIZE
- VERIFY:EM-EVENT-003 — EventService.publish transitions DRAFT → PUBLISHED only
- VERIFY:EM-EVENT-004 — EventService.cancel transitions any → CANCELLED except COMPLETED
- VERIFY:EM-EVENT-005 — EventController with @Public() on discovery endpoints
- VERIFY:EM-PERF-004 — Cache-Control: public, max-age=60 on public event list

## Venue Routes
- VERIFY:EM-VENUE-001 — VenueService CRUD with tenant scoping and pagination clamping

## Registration Routes
- VERIFY:EM-REG-001 — RegistrationService.register with atomic capacity check (transaction)
- VERIFY:EM-REG-002 — Duplicate registration prevention and cancellation with ticket decrement

## Check-In Routes
- VERIFY:EM-CHECKIN-001 — Idempotent check-in (returns existing if already checked in)
- VERIFY:EM-CHECKIN-002 — Check-in stats endpoint for event dashboard

## Notification Routes
- VERIFY:EM-NOTIF-001 — Broadcast with rate limiting per event
- VERIFY:EM-NOTIF-002 — Notification delivery tracking (SENT/FAILED status)

## Pagination
- VERIFY:EM-PAG-001 — Pagination clamps page/limit to valid ranges, never rejects
- Cross-reference: [monitoring.md](./monitoring.md) — Response time tracking on all endpoints
- Cross-reference: [data-model.md](./data-model.md) — Index coverage for common queries

## Security Configuration
- VERIFY:EM-SEC-001 — CORS with configurable origin from CORS_ORIGIN env
- VERIFY:EM-SEC-002 — Helmet middleware for security headers
- VERIFY:EM-SEC-003 — Global ValidationPipe with whitelist and transform
- VERIFY:EM-SEC-004 — ThrottlerModule with configurable ttl/limit

## Error Responses
- All errors return structured JSON via GlobalExceptionFilter: { statusCode, message, error, correlationId }
- 400 Bad Request — validation failures from ValidationPipe (whitelist violations, type mismatches)
- 401 Unauthorized — missing or invalid JWT token
- 404 Not Found — resource does not exist or is outside tenant scope
- 409 Conflict — duplicate registration or unique constraint violation
- 429 Too Many Requests — ThrottlerGuard rate limit exceeded
- Cross-reference: [monitoring.md](./monitoring.md) — All errors logged with correlation ID and sanitized context

## Public Discovery Endpoints
- GET /events/public — Paginated list of PUBLISHED events, Cache-Control header applied
- GET /events/slug/:slug — Single event lookup by URL-friendly slug
- These endpoints bypass JwtAuthGuard via @Public() decorator
- Cross-reference: [frontend.md](./frontend.md) — /discover route consumes public event endpoints

## Test Coverage
- VERIFY:EM-TEST-002 — Event integration test: create → publish → register → check-in
- VERIFY:EM-TEST-003 — Cross-layer integration: auth → event → registration flow
