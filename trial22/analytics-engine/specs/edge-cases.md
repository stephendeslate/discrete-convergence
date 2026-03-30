# Edge Cases Specification

## Overview

This document covers error handling, validation edge cases, and boundary
conditions in the Analytics Engine platform.

## Authentication Edge Cases

### Duplicate Email Registration
When a user registers with an email that already exists, the service
returns 409 Conflict. The check uses findFirst before create to prevent
race conditions at the application layer.

### Invalid Credentials
Login with wrong email or password returns 401 with a generic
"Invalid credentials" message to prevent user enumeration.

### Expired Refresh Token
If a refresh token has expired (expiresAt < now), the service
throws UnauthorizedException. The stored token is checked for both
existence and expiration.

### Missing Environment Variables
Bootstrap calls validateEnvVars(['DATABASE_URL', 'JWT_SECRET',
'JWT_REFRESH_SECRET']). Missing variables throw a descriptive error
before the application starts.

## Data Access Edge Cases

### Tenant Isolation Violations
Service layer checks findUnique result against the requesting user's
tenantId. If the record belongs to a different tenant, throws
NotFoundException (not ForbiddenException) to prevent information leakage.

### Not Found Resources
findOne methods throw NotFoundException when:
- Record does not exist (findUnique returns null)
- Record exists but belongs to different tenant

### Pagination Boundaries
- Page < 1 defaults to 1
- Limit > MAX_PAGE_SIZE capped at MAX_PAGE_SIZE
- Limit < 1 defaults to DEFAULT_PAGE_SIZE

## Validation Edge Cases

### Unknown Fields
ValidationPipe with forbidNonWhitelisted: true returns 400 Bad Request
when the request body contains fields not defined in the DTO.

### Missing Required Fields
class-validator decorators enforce required fields. Missing fields
return 400 with an array of validation error messages.

### Invalid Types
class-transformer with transform: true attempts type coercion.
Invalid types that cannot be coerced return 400.

## Database Edge Cases

### Connection Failure
- Health readiness probe catches connection errors and returns
  { database: 'disconnected' } instead of throwing
- PrismaService.onModuleInit connects; failures prevent app startup

### RLS Context Not Set
If setTenantContext is not called before a query, RLS policies will
filter out all rows (deny by default).

## Error Response Format

All errors follow a consistent format:
```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "correlationId": "abc-123"
}
```

## Rate Limiting Edge Cases

### Auth Endpoint Limits
Auth endpoints have stricter rate limits (10 per second) compared to
the global limit (100 per second). Exceeding the limit returns 429.

### Health Endpoints
Health and metrics endpoints do NOT have @SkipThrottle — they are
subject to the standard global throttle limits. This is intentional
to prevent abuse of public endpoints.

## Log Sanitization Edge Cases

### Sensitive Keys
sanitizeLogContext from @repo/shared redacts values for keys matching:
password, token, secret, authorization, cookie, apiKey, api_key

### Nested Objects
Sanitization recurses into nested objects and arrays.

### Non-Object Input
Primitives and null values pass through unchanged.
