# Monitoring Specification

## Overview

The Fleet Dispatch platform provides health check endpoints, structured logging,
request correlation tracking, and response time measurement for observability.

## Health Endpoints

### GET /health
- Public endpoint, no authentication required
- Returns: { status: 'ok', timestamp: ISO string }
- Used for liveness checks by orchestrators
- Must respond under 100ms <!-- VERIFY:FD-MON-003 -->

### GET /health/ready
- Public endpoint, no authentication required
- Performs database connectivity check via $queryRaw(SELECT 1)
- Returns: { status: 'ready', database: 'connected' } on success
- Returns: { status: 'not_ready', database: 'disconnected' } on failure
- Used for readiness checks by load balancers

### GET /health/metrics
- Public endpoint, no authentication required
- Returns system metrics:
  - uptime: process.uptime()
  - memory: process.memoryUsage()
  - timestamp: current ISO timestamp

## Structured Logging

### Logger Configuration
- nestjs-pino with LoggerModule.forRoot
- Pino HTTP integration for request/response logging
- Auto-logging disabled (autoLogging: false)
- pino-pretty for development formatting
- Each service has its own Logger instance

### Log Context
- Service name included in all log messages
- Correlation ID attached when available
- Sensitive data redacted via sanitizeLogData from @repo/shared

## Request Correlation

### CorrelationInterceptor
- Registered as APP_INTERCEPTOR
- Reads x-correlation-id from incoming request header
- Generates UUID v4 if header is missing
- Attaches correlation ID to response header
- Available throughout request lifecycle

### Correlation ID Format
- UUID v4 format (36 characters with hyphens)
- Validated with isValidCorrelationId from @repo/shared
- Header name: CORRELATION_ID_HEADER constant

## Response Time Tracking

### ResponseTimeInterceptor
- Registered as APP_INTERCEPTOR
- Measures request processing duration
- Sets X-Response-Time header with duration in ms
- Format: "Xms" (e.g., "12ms")

## Error Handling

### HttpExceptionFilter
- Registered as APP_FILTER
- Catches all HttpExceptions
- Returns consistent error response format:
  - statusCode: number
  - message: string or string[]
  - error: string (HTTP status text)
  - timestamp: ISO string
  - path: request URL
- Logs error details at appropriate level

## Audit Logging

- AuditLog entity records all mutating operations
- Fields: action, entity, entityId, userId, tenantId, details
- Actions: CREATE, UPDATE, DELETE, LOGIN
- Details stored as JSON for flexibility
- Indexed by tenantId, userId, entity for efficient queries
