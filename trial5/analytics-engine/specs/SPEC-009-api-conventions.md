# SPEC-009: API Conventions

> **Status:** APPROVED
> **Priority:** P1
> **Cross-references:** SPEC-005 (monitoring)

## Overview

This spec defines the REST API standards, pagination format, error response
structure, and header conventions used across all endpoints.

## Requirements

### REST Conventions
<!-- VERIFY: api-rest -->
- All endpoints use standard HTTP methods: GET (read), POST (create), PUT (update), DELETE (remove)
- POST returns 201 Created
- DELETE returns 204 No Content
- GET and PUT return 200 OK
- Error responses use appropriate 4xx/5xx status codes

### Pagination
<!-- VERIFY: api-pagination -->
- List endpoints accept page and limit query parameters
- Default page: 1, default limit: 20, max limit: 100
- Values are clamped via clampPagination from shared package
- Response format: { data: T[], meta: { total, page, limit, totalPages } }
- Results ordered by createdAt descending

### Error Format
<!-- VERIFY: api-errors -->
- Error responses include: { statusCode, message, correlationId, timestamp }
- correlationId from RequestContextService for request tracing
- GlobalExceptionFilter catches all unhandled exceptions
- HttpException messages are preserved; unknown exceptions return "Internal server error"
- Request body is sanitized before logging (sensitive fields redacted)

### Request Headers
<!-- VERIFY: api-request-headers -->
- Authorization: Bearer <token> for authenticated requests
- X-Correlation-ID: optional client-provided correlation ID
- Content-Type: application/json for request bodies

### Response Headers
<!-- VERIFY: api-response-headers -->
- X-Correlation-ID: echoed or generated correlation ID (see SPEC-005)
- X-Response-Time: request duration in milliseconds (see SPEC-005)
- Standard Helmet security headers

### Logging Conventions
<!-- VERIFY: api-logging -->
- All logging uses Pino (never console.log)
- Log entries use formatLogEntry from shared package
- Sensitive data redacted via sanitizeLogContext
- Every log entry includes correlationId from request context

### Database Conventions
<!-- VERIFY: api-database -->
- snake_case for database column names (via @@map in Prisma schema)
- camelCase for application code
- No $executeRaw or $executeRawUnsafe — use Prisma query builder
- Every findFirst() call requires a justification comment
- Use import type for type-only imports
