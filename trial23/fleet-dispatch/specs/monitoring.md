# Monitoring Specification

## Overview
Structured logging, health checks, and metrics endpoints for operational observability.

## Requirements

### FD-MON-001: Structured Logging
<!-- VERIFY: FD-MON-001 -->
Pino-based structured logging with JSON output in production. pino-pretty transport enabled ONLY when NODE_ENV === 'development'.

### FD-MON-002: Correlation ID
<!-- VERIFY: FD-MON-002 -->
Correlation ID middleware reads X-Correlation-ID from request headers or generates a new UUID. Propagated to response headers and log context.

### FD-MON-003: Health Endpoint
<!-- VERIFY: FD-MON-003 -->
GET /health is @Public() but NOT @SkipThrottle(). Returns status, timestamp, version, and database health check. Rate-limit headers are present on health responses.

### FD-MON-004: Exception Logging
<!-- VERIFY: FD-MON-004 -->
GlobalExceptionFilter logs all unhandled exceptions (500+) with stack traces. Client receives sanitized error response without internal details.
