# Monitoring Specification

## Overview

The Analytics Engine provides structured logging, correlation ID propagation, health
endpoints, and performance metrics. All monitoring endpoints are public (system-wide)
and do not require authentication.

See also: [Security](security.md) for the @Public() decorator mechanism.
See also: [Infrastructure](infrastructure.md) for CI/CD health check integration.

## Correlation IDs

- VERIFY: AE-MON-001 — createCorrelationId generates a unique identifier for request tracing

## Structured Logging

- VERIFY: AE-MON-002 — formatLogEntry produces structured log output with timestamp, level, message, and context

## Log Sanitization

- VERIFY: AE-MON-003 — sanitizeLogContext redacts sensitive fields (password, token, secret, authorization, cookie) case-insensitively, handles nested objects and arrays recursively

## Global Exception Filter

- VERIFY: AE-MON-004 — GlobalExceptionFilter catches all exceptions, includes correlationId in response, sanitizes error context, never exposes stack traces

## Correlation ID Middleware

- VERIFY: AE-MON-005 — CorrelationIdMiddleware attaches a correlation ID to each request via createCorrelationId from shared, sets X-Correlation-ID header

## Request Logging Middleware

- VERIFY: AE-MON-006 — RequestLoggingMiddleware logs request method, URL, and timing using formatLogEntry from shared

## Request Context Service

- VERIFY: AE-MON-007 — RequestContextService is request-scoped and stores per-request metadata (correlationId, startTime)

## Monitoring Service

- VERIFY: AE-MON-008 — MonitoringService provides health check (returns status + version from APP_VERSION), readiness check (verifies DB connectivity via $queryRaw), and metrics endpoint

## Monitoring Controller

- VERIFY: AE-MON-009 — MonitoringController exposes GET /health, GET /health/ready, GET /metrics; all methods are @Public(); health endpoint uses @SkipThrottle()
