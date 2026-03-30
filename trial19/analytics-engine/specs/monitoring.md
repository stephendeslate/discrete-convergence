# Monitoring Specification

## Overview

Structured logging with pino, correlation ID propagation, and health/metrics endpoints.

## Requirements

### AE-MON-001: Monitoring Service
- **VERIFY**: MonitoringService tracks request count, error count, and average response time
- Health check returns status, version, uptime, and timestamp

### AE-MON-002: Correlation ID Middleware
- **VERIFY**: Middleware sets X-Correlation-ID header from incoming request or generates new UUID
- Correlation ID propagated through request lifecycle for tracing

### AE-MON-003: Correlation ID Generator
- **VERIFY**: createCorrelationId() in shared package generates valid UUID v4 strings
- Used by middleware when no client correlation ID is present

### AE-MON-004: Log Format
- **VERIFY**: formatLogEntry() produces structured JSON log entries with timestamp, level, message, correlationId
- Log entries include request method, path, and duration

### AE-MON-005: Log Sanitizer
- **VERIFY**: sanitizeLogContext() redacts sensitive keys (password, token, secret, authorization)
- Handles deeply nested objects and arrays recursively
- Case-insensitive key matching

### AE-MON-006: Request Logging Middleware
- **VERIFY**: Request logging middleware logs all incoming requests with pino structured format
- Includes correlation ID, method, path, status code, and response duration
