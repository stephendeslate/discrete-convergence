# Monitoring Specification

## Overview

Fleet Dispatch implements observability through health checks, structured logging,
correlation IDs, response time tracking, and cache control headers.

## Health Checks

### GET /health
- Returns { status: 'ok', timestamp }
- @Public() — no authentication required
- Basic liveness check

### GET /health/ready
- Executes SELECT 1 against PostgreSQL
- Returns { status: 'ok', database: 'connected', timestamp } on success
- Returns { status: 'error', database: 'disconnected', timestamp } on failure

<!-- VERIFY: FD-MON-001 — Health controller has @Public() on both endpoints -->

## Correlation IDs

- CorrelationIdMiddleware runs on all routes
- Generates UUID via createCorrelationId from shared package
- Sets X-Correlation-ID header on both request and response
- Included in error responses via GlobalExceptionFilter

<!-- VERIFY: FD-MON-002 — CorrelationIdMiddleware uses createCorrelationId from @repo/shared -->

## Exception Logging

- GlobalExceptionFilter logs all unhandled exceptions
- Uses NestJS Logger with error level
- Sanitizes request body before debug logging
- Never exposes stack traces in HTTP responses

<!-- VERIFY: FD-MON-003 — GlobalExceptionFilter uses sanitizeLogContext from @repo/shared -->

## Response Time Tracking

- ResponseTimeInterceptor measures request duration
- Sets X-Response-Time header (e.g., "42ms")
- Applied globally via APP_INTERCEPTOR

<!-- VERIFY: FD-MON-004 — ResponseTimeInterceptor sets X-Response-Time header -->
<!-- VERIFY: FD-PERF-001 — ResponseTimeInterceptor measures request duration via Date.now() -->

## Cache Control

- CacheControlInterceptor sets Cache-Control headers on GET requests
- Applied on all findAll/list endpoints via @UseInterceptors
- CacheModule registered globally with TTL 60s and max 100 entries

<!-- VERIFY: FD-MON-005 — CacheModule registered with isGlobal: true -->
<!-- VERIFY: FD-PERF-003 — CacheControlInterceptor sets Cache-Control header on GET requests -->
