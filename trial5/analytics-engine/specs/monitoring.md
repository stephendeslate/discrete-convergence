# Monitoring Specification

## Overview

The Analytics Engine includes structured logging, health checks, metrics,
correlation ID tracking, and response time measurement.

## Request Logging

<!-- VERIFY: AE-MON-001 -->
- All requests are logged via Pino structured JSON logger
- Log entries include: method, url, statusCode, duration, correlationId
- Uses `formatLogEntry` from shared package for consistent format

## Correlation IDs

<!-- VERIFY: AE-MON-002 -->
- Every request receives a correlation ID (UUID v4)
- Client-provided `X-Correlation-ID` header is preserved if present
- Correlation ID is returned in response headers
- Stored in request-scoped RequestContextService

## Health Check

<!-- VERIFY: AE-MON-003 -->
- Endpoint: GET /monitoring/health (public)
- Checks database connectivity via `SELECT 1`
- Returns: status (healthy/degraded), version, timestamp, database status

## Exception Handling

<!-- VERIFY: AE-MON-004 -->
- Global exception filter catches all unhandled errors
- HTTP exceptions preserve their status code
- Unknown exceptions return 500 Internal Server Error
- Error responses include correlationId for debugging
- Request bodies are sanitized (passwords/tokens redacted) before logging

## Response Time

<!-- VERIFY: AE-MON-005 -->
- ResponseTimeInterceptor measures request duration using `performance.now()`
- Duration is set as `X-Response-Time` header on all responses

## Metrics

<!-- VERIFY: AE-MON-006 -->
- Endpoint: GET /monitoring/metrics (public)
- Returns: uptime, memory usage (rss, heapUsed, heapTotal, external), version, timestamp
