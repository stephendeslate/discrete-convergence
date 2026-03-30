# Security Specification

## Overview

The Event Management API implements defense-in-depth security through JWT authentication, role-based access control (RBAC), rate limiting, and input validation. All endpoints are protected by default via global APP_GUARD registration.

See also: [Authentication](authentication.md) for auth flow details, [API Endpoints](api-endpoints.md) for per-endpoint guards.

## Decorators and Guards

VERIFY: EM-SEC-001
@Public() decorator sets IS_PUBLIC_KEY metadata to bypass JWT authentication for specific endpoints (login, register, monitoring).

VERIFY: EM-SEC-002
@Roles() decorator sets ROLES_KEY metadata with allowed UserRole values. Applied to destructive operations (delete event, delete venue).

VERIFY: EM-SEC-003
RolesGuard implements CanActivate. If no roles metadata is set, access is allowed. Otherwise checks req.user.role against the allowed roles array.

VERIFY: EM-SEC-004
JwtAuthGuard extends AuthGuard('jwt'). Checks IS_PUBLIC_KEY via reflector — if true, skips authentication. Applied globally via APP_GUARD.

VERIFY: EM-SEC-005
Security integration tests verify: protected endpoints reject unauthenticated requests (401), role-restricted endpoints reject unauthorized users (403), and @Public() endpoints are accessible without tokens.

## Rate Limiting

ThrottlerModule is configured with two named rate limit tiers in AppModule:
- `default`: standard rate limit for normal endpoints
- `strict`: tighter rate limit for sensitive endpoints (auth)

ThrottlerGuard is registered as APP_GUARD so all endpoints are rate-limited by default. Monitoring health endpoint uses @SkipThrottle() to avoid rate limit interference with health checks.

## Input Validation

Global ValidationPipe with:
- `whitelist: true` — strips unrecognized properties
- `forbidNonWhitelisted: true` — rejects requests with unknown properties
- `transform: true` — auto-transforms payloads to DTO instances

All DTOs use class-validator decorators (@IsString, @IsEmail, @IsEnum, @IsOptional, @IsNumber, @IsDateString, @IsUUID, @Min, @Max, @MinLength, @MaxLength, @IsIn).

## HTTP Security Headers

Helmet middleware with Content-Security-Policy:
- `defaultSrc: ["'self'"]`
- `scriptSrc: ["'self'"]`

CORS enabled with configurable origin via CORS_ORIGIN environment variable.

## Sensitive Data Protection

SENSITIVE_KEYS constant defines field names that must be redacted in logs: password, token, secret, authorization, cookie, api_key, apiKey, access_token, refresh_token.

sanitizeLogContext() recursively traverses objects and arrays, replacing sensitive values with '[REDACTED]'. Case-insensitive key matching.

## Test Coverage

VERIFY: EM-EVENT-005
Event service unit tests verify CRUD operations, tenant scoping, and error handling for events.

VERIFY: EM-VENUE-005
Venue service unit tests verify CRUD operations, tenant scoping, and error handling for venues.

VERIFY: EM-TICKET-005
Ticket service unit tests verify CRUD operations including price validation with Decimal and status transitions.

VERIFY: EM-EVENT-006
Event integration tests verify end-to-end event API flow through controller with authentication.
