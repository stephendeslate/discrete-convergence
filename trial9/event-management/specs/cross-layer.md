# Cross-Layer Integration Specification

## Overview

This document describes the cross-layer integration verification requirements
for the Event Management platform. All layers (L0-L8) must function correctly
together as an integrated system.

## Global Provider Chain

VERIFY: EM-EVENT-001 — CreateEventDto validates title, dates, optional status, and venueId with class-validator

VERIFY: EM-EVENT-002 — Event service implements create, findAll, findOne, update, remove with tenant isolation

VERIFY: EM-VENUE-001 — CreateVenueDto validates name, address, capacity with class-validator

VERIFY: EM-VENUE-002 — Venue service implements CRUD operations with tenant isolation and pagination

VERIFY: EM-TICKET-001 — CreateTicketDto validates eventId, type, price, optional status

VERIFY: EM-TICKET-002 — Ticket service implements CRUD with tenant isolation

VERIFY: EM-ATTEND-001 — CreateAttendeeDto validates eventId and userId with MaxLength(36)

VERIFY: EM-ATTEND-002 — Attendee service prevents duplicate registration with ConflictException (409)

VERIFY: EM-SCHED-001 — CreateScheduleDto validates eventId, title, startTime, endTime, optional location

VERIFY: EM-SCHED-002 — Schedule service validates end time is after start time, throws BadRequestException

VERIFY: EM-PERF-001 — MAX_PAGE_SIZE constant (100) exported from shared package

VERIFY: EM-PERF-002 — DEFAULT_PAGE_SIZE constant (20) exported from shared package

VERIFY: EM-PERF-003 — parsePagination function clamps pageSize to MAX_PAGE_SIZE and calculates skip/take

VERIFY: EM-PERF-004 — Pagination utility in API wraps shared parsePagination for controller use

VERIFY: EM-PERF-005 — ResponseTimeInterceptor uses performance.now() and sets X-Response-Time header

AppModule registers all global providers via NestJS DI:
- APP_GUARD: ThrottlerGuard (rate limiting)
- APP_GUARD: JwtAuthGuard (authentication)
- APP_GUARD: RolesGuard (authorization)
- APP_FILTER: GlobalExceptionFilter (error handling)
- APP_INTERCEPTOR: ResponseTimeInterceptor (performance tracking)

Domain controllers do NOT use @UseGuards(JwtAuthGuard) — they rely on the global guard.

## Middleware Chain

CorrelationIdMiddleware and RequestLoggingMiddleware applied to all routes.
Order: CorrelationId → RequestLogging → Guards → Interceptors → Controllers

## Full Pipeline Test

Cross-layer integration test verifies:
1. Auth: register, login, get JWT token
2. CRUD: create, read, update, delete events
3. Error handling: 404 returns sanitized error with correlationId
4. Response time: X-Response-Time header on all responses
5. Health: /health returns APP_VERSION from shared
6. DB check: /health/ready verifies database connectivity
7. Guard chain: 401 for missing token, 403 for wrong role

## Shared Package Integration

packages/shared is used by >= 3 files in each app:
- API: constants, correlation, pagination, sanitizer, log format, env validation
- Web: constants (APP_VERSION), actions (API_ROUTES)

## Cumulative Regression

All L0-L8 checks must pass simultaneously:
- Build: turbo build exits 0
- Lint: turbo lint exits 0
- Types: turbo typecheck exits 0
- Tests: all suites pass
- Specs: zero orphan tags
- Security: all gates pass
