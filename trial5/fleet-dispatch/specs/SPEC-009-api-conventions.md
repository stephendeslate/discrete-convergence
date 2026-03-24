# SPEC-009: API Conventions

**Status:** APPROVED
**Domain:** Architecture — API Design
**Cross-references:** [SPEC-001](SPEC-001-authentication.md), [SPEC-006](SPEC-006-multi-tenancy.md), [SPEC-008](SPEC-008-security.md)

## Overview

This document defines the conventions and patterns used across all Fleet Dispatch
API endpoints for consistency and maintainability.

## URL Structure

- Base path: no global prefix (e.g., `/vehicles`, `/drivers`)
- Resource names are plural: `/vehicles`, `/deliveries`, `/routes`
- Nested resources use flat URLs with query params, not deep nesting

## HTTP Methods

| Method | Semantics |
|--------|-----------|
| POST | Create a new resource |
| GET | Retrieve resource(s) |
| PUT | Full or partial update |
| DELETE | Remove a resource |

## Pagination

All list endpoints support pagination via query parameters:
- `?page=1` — 1-based page number (default: 1)
- `?pageSize=20` — items per page (default: 20, max: 100)

Response format:
```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5
  }
}
```

<!-- VERIFY:FD-PERF-001 — pagination clamping (never rejects, always clamps) -->

## Request Validation

- All DTOs use `class-validator` decorators
- Unknown properties are stripped (`whitelist: true`)
- Requests with unknown properties are rejected (`forbidNonWhitelisted: true`)
- UUID parameters validated via `ParseUUIDPipe`

## Error Responses

```json
{
  "statusCode": 404,
  "message": "Vehicle not found",
  "correlationId": "uuid-string",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Standard HTTP status codes:
- `200` — success
- `201` — created
- `400` — validation error
- `401` — unauthorized
- `403` — forbidden (insufficient role)
- `404` — resource not found
- `409` — conflict (e.g., duplicate)
- `429` — rate limited
- `500` — internal server error

## Correlation ID

- `X-Correlation-ID` header propagated through all requests
- Client-provided ID is preserved; otherwise auto-generated
- Included in all error responses and logs

<!-- VERIFY:FD-MON-009 — correlation ID middleware -->

## Response Time Header

- `X-Response-Time` header added to all responses
- Format: `123.45ms`

<!-- VERIFY:FD-PERF-002 — response time interceptor -->

## Structured Logging

- All logging uses Pino (no console.log)
- Logs include method, URL, status code, duration, correlation ID
- Sensitive fields (password, token, etc.) are sanitized

<!-- VERIFY:FD-MON-005 — Pino structured logger -->
<!-- VERIFY:FD-MON-010 — request logging middleware -->

## Database Conventions

- `snake_case` column names in PostgreSQL (via `@@map`)
- `camelCase` field names in application code
- `Decimal` type for monetary values (cost) and measurements (mileage, distance)
- No `$executeRaw` usage — only Prisma Client queries
- `findFirst` usage requires a comment explaining the reason
